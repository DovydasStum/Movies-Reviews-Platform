using Microsoft.AspNetCore.Identity;
using MoviesReviewsPlatform.Auth.Model;
using MoviesReviewsPlatform.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace MoviesReviewsPlatform.Auth;

public static class AuthEndpoints
{
    public static void AddAuthApi(this WebApplication app)
    {
        // Register
        app.MapPost("api/register", async (UserManager<PlatformRestUser> userManager, RegisterUserDto registerUserDto) =>
        {
            // Check if user exists
            var user = await userManager.FindByIdAsync(registerUserDto.Username);
            if (user != null)
            {
                return Results.UnprocessableEntity("User name already taken.");
            }

            var newUser = new PlatformRestUser
            {
                Email = registerUserDto.Email,
                UserName = registerUserDto.Username,
            };

            var createUserResult = await userManager.CreateAsync(newUser, registerUserDto.Password);
            if (!createUserResult.Succeeded)
            {
                return Results.UnprocessableEntity();
            }

            await userManager.AddToRoleAsync(newUser, PlatformRoles.PlatformUser);

            return Results.Created("api/login", new UserDto(newUser.Id, newUser.UserName, newUser.Email));
        });

        // Login
        app.MapPost("api/login", async (UserManager<PlatformRestUser> userManager, JwtTokenService jwtTokenService, LoginDto loginDto) =>
        {
            // Check if user exists
            var user = await userManager.FindByIdAsync(loginDto.Username);
            if (user == null)
            {
                return Results.UnprocessableEntity("Username or password is incorrect.");
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!isPasswordValid)
            {
                return Results.UnprocessableEntity("Username or password is incorrect.");
            }

            user.ForceRelogin = false;
            await userManager.UpdateAsync(user);

            var roles = await userManager.GetRolesAsync(user);
            var accessToken = jwtTokenService.CreateAccessToken(user.UserName, user.Id, roles);
            var refreshToken = jwtTokenService.CreateRefreshToken(user.Id);

            return Results.Ok(new SuccessfulLoginDto(accessToken, refreshToken));
        });

        // AccessToken
        app.MapPost("api/accessToken",
                async (UserManager<PlatformRestUser> userManager, JwtTokenService jwtTokenService, RefreshAccessTokenDto refreshAccessTokenDto) =>
        {
            if (jwtTokenService.TryParseRefreshToken(refreshAccessTokenDto.RefreshToken, out var claims)) // token no longer valid
            {
                return Results.UnprocessableEntity();
            }

            var userId = claims.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Results.UnprocessableEntity("Invalid token");
            }

            if (user.ForceRelogin)
            {
                return Results.UnprocessableEntity();
            }

            var roles = await userManager.GetRolesAsync(user);
            var accessToken = jwtTokenService.CreateAccessToken(user.UserName, user.Id, roles);
            var refreshToken = jwtTokenService.CreateRefreshToken(user.Id);

            return Results.Ok(new SuccessfulLoginDto(accessToken, refreshToken));
        });
    }
}

public record RegisterUserDto(string Username, string Email, string Password);
public record UserDto(string UserId, string Username, string Email);
public record LoginDto(string Username, string Password);
public record SuccessfulLoginDto(string AccessToken, string RefreshToken);
public record RefreshAccessTokenDto(string RefreshToken);
