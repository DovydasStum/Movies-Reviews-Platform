using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MoviesReviewsPlatform;
using MoviesReviewsPlatform.Auth;
using MoviesReviewsPlatform.Auth.Model;
using MoviesReviewsPlatform.Data;
using MoviesReviewsPlatform.Data.Entities;
using O9d.AspNet.FluentValidation;
using SharpGrip.FluentValidation.AutoValidation.Endpoints.Extensions;
using SharpGrip.FluentValidation.AutoValidation.Endpoints.Results;
using SharpGrip.FluentValidation.AutoValidation.Shared.Extensions;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ForumDbContext>();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddTransient<JwtTokenService>();
builder.Services.AddScoped<AuthDbSeeder>();

builder.Services.AddFluentValidationAutoValidation(configuration =>
{
    configuration.OverrideDefaultResultFactoryWith<ProblemDetailsResultFactory>();
});

// Authorization
builder.Services.AddIdentity<PlatformRestUser, IdentityRole>()
    .AddEntityFrameworkStores<ForumDbContext>()
    .AddDefaultTokenProviders();

// Authorization: token validation
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters.ValidAudience = builder.Configuration["Jwt:ValidAudience"];
    options.TokenValidationParameters.ValidIssuer = builder.Configuration["Jwt:ValidIssuer"];
    options.TokenValidationParameters.IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]));
});

builder.Services.AddAuthorization();


var app = builder.Build();

// Movies api call
app.AddMovieApi();

// Reviews api call
app.AddReviewApi();

// Comments api call
app.AddCommentApi();


app.AddAuthApi();
app.UseAuthentication();
app.UseAuthorization();


using var scope = app.Services.CreateScope();
var dbSeeder = scope.ServiceProvider.GetRequiredService<AuthDbSeeder>();
await dbSeeder.SendAsync();

app.Run();


// For movies -----------------
public record CreateMovieDto(string Name, string Description, string Director, string Actors,
                             int ReleaseYear, TimeSpan Duration, string Genre);

public record UpdateMovieDto(string Name, string Description, string Director, string Actors,
                             int ReleaseYear, TimeSpan Duration, string Genre);

public class CreateMovieDtoValidator : AbstractValidator<CreateMovieDto>
{
    public CreateMovieDtoValidator()
    {
        RuleFor(dto => dto.Name).NotEmpty().NotNull().Length(min: 1, max: 100);
        RuleFor(dto => dto.Description).NotEmpty().NotNull().Length(min: 2, max: 300);
        RuleFor(dto => dto.Director).NotEmpty().NotNull().Length(min: 2, max: 100);
        RuleFor(dto => dto.Actors).NotEmpty().NotNull().Length(min: 2, max: 300);
        RuleFor(dto => dto.ReleaseYear).LessThan(1+int.Parse((DateTime.Now.Year).ToString())).GreaterThan(1900);
        RuleFor(dto => dto.Duration).Must(BeValidDurationFormat)
            .WithMessage("Duration must be in the format H:mm, where H is hours and mm is minutes.")
            .GreaterThan(TimeSpan.Zero);
    }
    
    private bool BeValidDurationFormat(TimeSpan duration)
    {
    
        return duration.Minutes < 60 && duration.Hours >= 0;
    }
}

public class UpdateMovieDtoValidator : AbstractValidator<UpdateMovieDto>
{
    public UpdateMovieDtoValidator()
    {
        RuleFor(dto => dto.Name).NotEmpty().NotNull().Length(min: 1, max: 100);
        RuleFor(dto => dto.Description).NotEmpty().NotNull().Length(min: 2, max: 300);
        RuleFor(dto => dto.Director).NotEmpty().NotNull().Length(min: 2, max: 100);
        RuleFor(dto => dto.Actors).NotEmpty().NotNull().Length(min: 2, max: 300);
        RuleFor(dto => dto.ReleaseYear).LessThan(1+int.Parse((DateTime.Now.Year).ToString())).GreaterThan(1900);
        RuleFor(dto => dto.Duration).Must(BeValidDurationFormat)
            .WithMessage("Duration must be in the format H:mm, where H is hours and mm is minutes.")
            .GreaterThan(TimeSpan.Zero);
    }
    
    private bool BeValidDurationFormat(TimeSpan duration)
    {
        return duration.Minutes < 60 && duration.Hours >= 0;
    }
}

// For reviews -----------------
public record CreateReviewDto(string Text, int Evaluation);

public record UpdateReviewDto(string Text, int Evaluation);

public class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewDtoValidator()
    {
        RuleFor(dto => dto.Text).NotEmpty().NotNull().Length(min: 2, max: 500);
        RuleFor(dto => dto.Evaluation).GreaterThan(0).LessThan(11);
    }
}

public class UpdateReviewDtoValidator : AbstractValidator<UpdateReviewDto>
{
    public UpdateReviewDtoValidator()
    {
        RuleFor(dto => dto.Text).NotEmpty().NotNull().Length(min: 2, max: 500);
        RuleFor(dto => dto.Evaluation).GreaterThan(0).LessThan(11);
    }
}

// For comments -----------------
public record CreateCommentDto(string Text);

public record UpdateCommentDto(string Text);

public class CreateCommentDtoValidator : AbstractValidator<CreateCommentDto>
{
    public CreateCommentDtoValidator()
    {
        RuleFor(dto => dto.Text).NotEmpty().NotNull().Length(min: 2, max: 500);
    }
}

public class UpdateCommentDtoValidator : AbstractValidator<UpdateCommentDto>
{
    public UpdateCommentDtoValidator()
    {
        RuleFor(dto => dto.Text).NotEmpty().NotNull().Length(min: 2, max: 500);
    }
}

public class ProblemDetailsResultFactory : IFluentValidationAutoValidationResultFactory
{
    public IResult CreateResult(EndpointFilterInvocationContext context, ValidationResult validationResult)
    {
        var problemDetails = new HttpValidationProblemDetails(validationResult.ToValidationProblemErrors())
        {
            Type =  "https://tools.ietf.org/html/rfc4918#section-11.2",
            Title = "Unprocessable Entity",
            Status = 422
        };
        
        return TypedResults.Problem(problemDetails);
    }
}