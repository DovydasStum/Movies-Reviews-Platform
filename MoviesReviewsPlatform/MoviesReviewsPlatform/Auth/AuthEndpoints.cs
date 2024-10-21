using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using MoviesReviewsPlatform.Auth.Model;
using MoviesReviewsPlatform.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security.Claims;

namespace MoviesReviewsPlatform.Auth;

public static class AuthEndpoints
{
    public static void AddAuthApi(this WebApplication app)
    {
        // Register
        app.MapPost("api/accounts", async (UserManager<PlatformRestUser> userManager, RegisterUserDto registerUserDto) =>
        {
            // Check if user exists
            var user = await userManager.FindByNameAsync(registerUserDto.Username);
            if (user != null)
            {
                return Results.UnprocessableEntity("User name already taken.");
            }

            var newUser = new PlatformRestUser()
            {
                Email = registerUserDto.Email,
                UserName = registerUserDto.Username,
            };

            // TODO: wrap in one transaction
            var createUserResult = await userManager.CreateAsync(newUser, registerUserDto.Password);
            if (!createUserResult.Succeeded)
            {
                return Results.UnprocessableEntity();
            }

            await userManager.AddToRoleAsync(newUser, PlatformRoles.PlatformUser);
            // ----

            return Results.Created("api/login", new UserDto(newUser.Id, newUser.UserName, newUser.Email));
        });

        // Login
        app.MapPost("api/login", async (UserManager<PlatformRestUser> userManager, JwtTokenService jwtTokenService, 
            SessionService sessionService, HttpContext httpContext, LoginDto loginDto) =>
        {
            // Check if user exists
            var user = await userManager.FindByNameAsync(loginDto.Username);
            if (user == null)
            {
                return Results.UnprocessableEntity("Username or password is incorrect.");
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!isPasswordValid)
            {
                return Results.UnprocessableEntity("Username or password is incorrect.");
            }

            var roles = await userManager.GetRolesAsync(user);
            var sessionId = Guid.NewGuid();
            var expiresAt = DateTime.UtcNow.AddDays(3);
            var accessToken = jwtTokenService.CreateAccessToken(user.UserName, user.Id, roles);
            var refreshToken = jwtTokenService.CreateRefreshToken(sessionId, user.Id, expiresAt);

            await sessionService.CreateSessionAsync(sessionId, user.Id, refreshToken, expiresAt);

            var cookieOptions = new CookieOptions
            { 
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Expires = expiresAt,
                //Secure = false (should be true)
            };

            httpContext.Response.Cookies.Append("RefreshToken", refreshToken, cookieOptions);

            return Results.Ok(new SuccessfulLoginDto(accessToken));
        });

        // AccessToken
        app.MapPost("api/accessToken",
                async (UserManager<PlatformRestUser> userManager, JwtTokenService jwtTokenService,
                SessionService sessionService, HttpContext httpContext) =>
        {
            if (!httpContext.Request.Cookies.TryGetValue("RefreshToken", out var refreshToken))
            {
                return Results.UnprocessableEntity();
            }                    

            if (jwtTokenService.TryParseRefreshToken(refreshToken, out var claims)) // token no longer valid
            {
                return Results.UnprocessableEntity();
            }

            var sessionId = claims.FindFirstValue("SessionId");
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return Results.UnprocessableEntity();
            }

            var sessionIdAsGuid = Guid.Parse(sessionId);
            if (!await sessionService.IsSessionValidAsync(sessionIdAsGuid, refreshToken))
            {
                return Results.UnprocessableEntity();
            }

            var userId = claims.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Results.UnprocessableEntity();
            }

            var roles = await userManager.GetRolesAsync(user);
            var expiresAt = DateTime.UtcNow.AddDays(3);
            var accessToken = jwtTokenService.CreateAccessToken(user.UserName, user.Id, roles);
            var newRefreshToken = jwtTokenService.CreateRefreshToken(sessionIdAsGuid, user.Id, expiresAt);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Expires = expiresAt,
                //Secure = false (should be true)
            };

            httpContext.Response.Cookies.Append("RefreshToken", newRefreshToken, cookieOptions);

            await sessionService.ExtendedSessionAsync(sessionIdAsGuid, newRefreshToken, expiresAt);

            return Results.Ok(new SuccessfulLoginDto(accessToken));
        });


        // Logout
        app.MapPost("api/logout",
                async (UserManager<PlatformRestUser> userManager, JwtTokenService jwtTokenService,
                SessionService sessionService, HttpContext httpContext) =>
                {
                    if (!httpContext.Request.Cookies.TryGetValue("RefreshToken", out var refreshToken))
                    {
                        return Results.UnprocessableEntity();
                    }

                    if (jwtTokenService.TryParseRefreshToken(refreshToken, out var claims)) // token no longer valid
                    {
                        return Results.UnprocessableEntity();
                    }

                    var sessionId = claims.FindFirstValue("SessionId");
                    if (string.IsNullOrWhiteSpace(sessionId))
                    {
                        return Results.UnprocessableEntity();
                    }
                   
                    await sessionService.InvalidateSessionAsync(Guid.Parse(sessionId));
                    httpContext.Response.Cookies.Delete("RefreshToken");

                    return Results.Ok();
                });

    }
}

public record RegisterUserDto(string Username, string Email, string Password);
public record UserDto(string UserId, string Username, string Email);
public record LoginDto(string Username, string Password);
public record SuccessfulLoginDto(string AccessToken);
