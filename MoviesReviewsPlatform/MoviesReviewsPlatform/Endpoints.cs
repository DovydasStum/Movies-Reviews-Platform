using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;
using MoviesReviewsPlatform.Auth.Model;
using MoviesReviewsPlatform.Data;
using MoviesReviewsPlatform.Data.Entities;
using MoviesReviewsPlatform.Helpers;
using O9d.AspNet.FluentValidation;

namespace MoviesReviewsPlatform
{
    public static class Endpoints
    {
        // reviews?pageNumber=1&pageSize=3
        
        // Movie api methods
        public static void AddMovieApi(this WebApplication app)
        {
            var moviesGroup = app.MapGroup("/api").WithValidationFilter();

            // Get all movies
            moviesGroup.MapGet("movies", async ([AsParameters] SearchParameters searchParameters,
                ForumDbContext dbContext, LinkGenerator linkGenerator, HttpContext httpContext) =>
            {
                var queryable = dbContext.Movies.AsQueryable().OrderBy(m => m.Name);
                var pagedList = await PagedList<Movie>.CreateAsync(queryable, searchParameters.PageNumber!.Value, 
                    searchParameters.PageSize!.Value);
                
                var previousPageLink = pagedList.HasPrevious ?
                    linkGenerator.GetUriByName(httpContext, "GetMovies",
                    new {pageNumber = searchParameters.PageNumber - 1, pageSize = searchParameters.PageSize})
                    : null;
                
                var nextPageLink = pagedList.HasNext ?
                    linkGenerator.GetUriByName(httpContext, "GetMovies",
                        new {pageNumber = searchParameters.PageNumber + 1, pageSize = searchParameters.PageSize})
                    : null;
                
                var paginationMetadata = new PaginationMetadata(pagedList.TotalCount, pagedList.PageSize,
                    pagedList.CurrentPage, pagedList.TotalPages, previousPageLink, nextPageLink);
                
                httpContext.Response.Headers.Add("Pagination", JsonSerializer.Serialize(paginationMetadata));
                
                return pagedList.Select(movie => new MovieDto(movie.Id, movie.Name,
                    movie.Description, movie.Director, movie.Actors, movie.ReleaseYear, movie.Duration, movie.Genre));
            }).WithName("GetMovies");

            // Get one movie
            moviesGroup.MapGet("movies/{movieId}", async (int movieId, ForumDbContext dbContext) =>
            {
                var movie = await dbContext.Movies.FirstOrDefaultAsync(m => m.Id == movieId);
                if (movie == null)
                    return Results.NotFound();

                return TypedResults.Ok(new MovieDto(movie.Id, movie.Name,
                    movie.Description, movie.Director, movie.Actors, movie.ReleaseYear, movie.Duration, movie.Genre));
            }).WithName("GetMovie");

            // Create movie
            moviesGroup.MapPost("movies", [Authorize(Roles = PlatformRoles.PlatformUser)] async ([Validate] CreateMovieDto createMovieDto, 
                HttpContext httpContext, LinkGenerator linkGenerator, ForumDbContext dbContext) =>
            {
                var movie = new Movie()
                {
                    Name = createMovieDto.Name,
                    Description = createMovieDto.Description,
                    Director = createMovieDto.Director,
                    Actors = createMovieDto.Actors,
                    ReleaseYear = createMovieDto.ReleaseYear,
                    Duration = createMovieDto.Duration,
                    Genre = createMovieDto.Genre,
                    UserId = httpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                };

                dbContext.Movies.Add(movie);
                await dbContext.SaveChangesAsync();
                
                var links = CreateLinks(movie.Id, httpContext, linkGenerator);
                var movieDto = new CreateMovieDto(movie.Name,
                    movie.Description, movie.Director, movie.Actors, movie.ReleaseYear, movie.Duration, movie.Genre);
                var resource = new ResourceDto<CreateMovieDto>(movieDto, links.ToArray());

                return TypedResults.Created($"/api/movies/{movie.Id}", resource);
            }).WithName("CreateMovie");

            // Update movie
            moviesGroup.MapPut("movies/{movieId}", [Authorize(Roles = PlatformRoles.PlatformUser)] async (int movieId, [Validate] UpdateMovieDto movieDto, 
                ForumDbContext dbContext, HttpContext httpContent) =>
            {
                var movie = await dbContext.Movies.FirstOrDefaultAsync(m => m.Id == movieId);
                if (movie == null)
                    return Results.NotFound();

                if(!httpContent.User.IsInRole(PlatformRoles.Admin) && httpContent.User.FindFirstValue(JwtRegisteredClaimNames.Sub) != movie.UserId)
                {
                    return Results.NotFound();
                }

                movie.Name = movieDto.Name;
                movie.Description = movieDto.Description;
                movie.Director = movieDto.Director;
                movie.Actors = movieDto.Actors;
                movie.ReleaseYear = movieDto.ReleaseYear;
                movie.Duration = movieDto.Duration;
                movie.Genre = movieDto.Genre;

                dbContext.Update(movie);
                await dbContext.SaveChangesAsync();

                return Results.Ok(new UpdateMovieDto(movie.Name,
                    movie.Description, movie.Director, movie.Actors, movie.ReleaseYear, movie.Duration, movie.Genre));
            }).WithName("EditMovie");

            // Delete movie
            moviesGroup.MapDelete("movies/{movieId}", async (int movieId, ForumDbContext dbContext) =>
            {
                var movie = await dbContext.Movies.FirstOrDefaultAsync(m => m.Id == movieId);
                if (movie == null)
                    return Results.NotFound();

                dbContext.Remove(movie);
                await dbContext.SaveChangesAsync();

                return Results.NoContent();
            }).WithName("DeleteMovie");
        }

        static IEnumerable<LinkDto> CreateLinks(int movieId, HttpContext httpContext, LinkGenerator linkGenerator)
        {
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "GetMovie",
                new { movieId }), "self", "GET");
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "EditMovie",
                new { movieId }), "edit", "PUT");
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "DeleteMovie",
                new { movieId }), "delete", "DELETE");
        }
        
        // Review api methods
        public static void AddReviewApi(this WebApplication app)
        {
            var reviewsGroup = app.MapGroup("/api/movies/{movieId}/reviews").WithValidationFilter();
            
            reviewsGroup.MapGet("", async ([AsParameters] SearchParameters searchParameters, 
                int movieId, ForumDbContext dbContext, LinkGenerator linkGenerator, HttpContext httpContext) =>
            {
                var queryable = dbContext.Reviews
                    .Where(r => r.Movie.Id == movieId) 
                    .OrderBy(r => r.Date);
                
                var pagedList = await PagedList<Review>.CreateAsync(queryable, searchParameters.PageNumber!.Value,
                    searchParameters.PageSize!.Value);

                var previousPageLink = pagedList.HasPrevious ? 
                    linkGenerator.GetUriByName(httpContext, "GetReviews", 
                    new { movieId, pageNumber = searchParameters.PageNumber - 1, pageSize = searchParameters.PageSize }) : null;

                var nextPageLink = pagedList.HasNext ? 
                    linkGenerator.GetUriByName(httpContext, "GetReviews", 
                    new { movieId, pageNumber = searchParameters.PageNumber + 1, pageSize = searchParameters.PageSize }) : null;

                var paginationMetadata = new PaginationMetadata(pagedList.TotalCount, pagedList.PageSize, 
                    pagedList.CurrentPage, pagedList.TotalPages, previousPageLink, nextPageLink);

                httpContext.Response.Headers.Add("Pagination", JsonSerializer.Serialize(paginationMetadata));

                var reviews = pagedList.Select(review => new ReviewDto(review.Id, review.Text,
                    review.Evaluation, review.Date));
                return Results.Ok(reviews);
            }).WithName("GetReviews");

            // Get a review
            reviewsGroup.MapGet("{reviewId}", async (int movieId, int reviewId, ForumDbContext dbContext, 
                LinkGenerator linkGenerator, HttpContext httpContext) =>
            {
                var review = await dbContext.Reviews.Include(r => r.Movie)
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.Movie.Id == movieId);
                if (review == null) return Results.NotFound();

                var links = CreateReviewLinks(movieId, reviewId, httpContext, linkGenerator);
                var reviewDto = new ReviewDto(review.Id, review.Text, review.Evaluation, review.Date);
                var resource = new ResourceDto<ReviewDto>(reviewDto, links.ToArray());

                return Results.Ok(resource);
            }).WithName("GetReview");

            // Create a new review
            reviewsGroup.MapPost("", async (int movieId, [Validate] CreateReviewDto createReviewDto, 
                ForumDbContext dbContext, LinkGenerator linkGenerator, HttpContext httpContext) =>
            {
                var movie = await dbContext.Movies.FirstOrDefaultAsync(m => m.Id == movieId);
                if (movie == null) return Results.NotFound();

                var review = new Review
                {
                    Text = createReviewDto.Text,
                    Evaluation = createReviewDto.Evaluation,
                    Date = DateTime.UtcNow,
                    Movie = movie,
                    UserId = httpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                };

                dbContext.Reviews.Add(review);
                await dbContext.SaveChangesAsync();

                var links = CreateReviewLinks(movieId, review.Id, httpContext, linkGenerator);
                var resource = new ResourceDto<CreateReviewDto>(createReviewDto, links.ToArray());

                return TypedResults.Created($"/api/movies/{movieId}/reviews/{review.Id}", resource);
            }).WithName("CreateReview");

            // Update a review
            reviewsGroup.MapPut("{reviewId}", async (int movieId, int reviewId, 
                [Validate] UpdateReviewDto updateReviewDto, ForumDbContext dbContext) =>
            {
                var review = await dbContext.Reviews.Include(r => r.Movie)
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.Movie.Id == movieId);
                if (review == null) return Results.NotFound();

                review.Text = updateReviewDto.Text;
                review.Evaluation = updateReviewDto.Evaluation;
                review.Date = DateTime.UtcNow; // Update timestamp

                dbContext.Update(review);
                await dbContext.SaveChangesAsync();

                return Results.Ok(new UpdateReviewDto(review.Text, review.Evaluation));
            }).WithName("UpdateReview");

            // Delete a review
            reviewsGroup.MapDelete("{reviewId}", async (int movieId, int reviewId, ForumDbContext dbContext) =>
            {
                var review = await dbContext.Reviews.Include(r => r.Movie)
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.Movie.Id == movieId);
                if (review == null) return Results.NotFound();

                dbContext.Reviews.Remove(review);
                await dbContext.SaveChangesAsync();

                return Results.NoContent();
            }).WithName("DeleteReview");
        }
        
        static IEnumerable<LinkDto> CreateReviewLinks(int movieId, int reviewId, HttpContext httpContext, LinkGenerator linkGenerator)
        {
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "GetReview", new { movieId, reviewId }), "self", "GET");
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "UpdateReview", new { movieId, reviewId }), "update", "PUT");
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "DeleteReview", new { movieId, reviewId }), "delete", "DELETE");
        }
        
         // Comment api methods
        public static void AddCommentApi(this WebApplication app)
        {
            var commentsGroup = app.MapGroup("/api/movies/{movieId}/reviews/{reviewId}/comments").WithValidationFilter();
            
            commentsGroup.MapGet("", async ([AsParameters] SearchParameters searchParameters, 
                int movieId, int reviewId, ForumDbContext dbContext, LinkGenerator linkGenerator, HttpContext httpContext) =>
            {
                var queryable = dbContext.Comments
                    .Where(c => c.Review.Id == reviewId && c.Review.Movie.Id == movieId)
                    .OrderBy(c => c.Date);  
                
                var pagedList = await PagedList<Comment>.CreateAsync(queryable, searchParameters.PageNumber!.Value,
                    searchParameters.PageSize!.Value);
                
                var previousPageLink = pagedList.HasPrevious ?
                    linkGenerator.GetUriByName(httpContext, "GetComments", 
                        new { movieId, reviewId, pageNumber = searchParameters.PageNumber - 1, pageSize = searchParameters.PageSize }) : null;

                var nextPageLink = pagedList.HasNext ?
                    linkGenerator.GetUriByName(httpContext, "GetComments", 
                        new { movieId, reviewId, pageNumber = searchParameters.PageNumber + 1, pageSize = searchParameters.PageSize }) : null;
                
                var paginationMetadata = new PaginationMetadata(pagedList.TotalCount, pagedList.PageSize, 
                    pagedList.CurrentPage, pagedList.TotalPages, previousPageLink, nextPageLink);
                
                httpContext.Response.Headers.Add("Pagination", JsonSerializer.Serialize(paginationMetadata));
                
                var comments = pagedList.Select(comment => new CommentDto(comment.Id, comment.Text, comment.Date));
                return Results.Ok(comments);
            }).WithName("GetComments");


            // Get a comment
            commentsGroup.MapGet("{commentId}", async (int movieId, int reviewId, int commentId, ForumDbContext dbContext, 
                LinkGenerator linkGenerator, HttpContext httpContext) =>
            {
                var comment = await dbContext.Comments.Include(c => c.Review).ThenInclude(r => r.Movie)
                    .FirstOrDefaultAsync(c => c.Id == commentId && c.Review.Id == reviewId && c.Review.Movie.Id == movieId);
                if (comment == null) return Results.NotFound();

                var links = CreateCommentLinks(movieId, reviewId, commentId, httpContext, linkGenerator);
                var commentDto = new CommentDto(comment.Id, comment.Text, comment.Date);
                var resource = new ResourceDto<CommentDto>(commentDto, links.ToArray());

                return Results.Ok(resource);
            }).WithName("GetComment");

            // Create a new comment
            commentsGroup.MapPost("", async (int movieId, int reviewId, 
                [Validate] CreateCommentDto createCommentDto, ForumDbContext dbContext, LinkGenerator linkGenerator, 
                HttpContext httpContext) =>
            {
                var review = await dbContext.Reviews.Include(r => r.Movie)
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.Movie.Id == movieId);
                if (review == null) return Results.NotFound();

                var comment = new Comment
                {
                    Text = createCommentDto.Text,
                    Date = DateTime.UtcNow,
                    Review = review,
                    UserId = httpContext.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                };

                dbContext.Comments.Add(comment);
                await dbContext.SaveChangesAsync();

                var links = CreateCommentLinks(movieId, reviewId, comment.Id, httpContext, linkGenerator);
                var resource = new ResourceDto<CreateCommentDto>(createCommentDto, links.ToArray());

                return TypedResults.Created($"/api/movies/{movieId}/reviews/{reviewId}/comments/{comment.Id}", resource);
            }).WithName("CreateComment");

            // Update a comment
            commentsGroup.MapPut("{commentId}", async (int movieId, int reviewId, int commentId, 
                [Validate] UpdateCommentDto updateCommentDto, ForumDbContext dbContext) =>
            {
                var comment = await dbContext.Comments.Include(c => c.Review).ThenInclude(r => r.Movie)
                    .FirstOrDefaultAsync(c => c.Id == commentId && c.Review.Id == reviewId && c.Review.Movie.Id == movieId);
                if (comment == null) return Results.NotFound();

                comment.Text = updateCommentDto.Text;
                comment.Date = DateTime.UtcNow; // Update timestamp

                dbContext.Update(comment);
                await dbContext.SaveChangesAsync();

                return Results.Ok(new UpdateCommentDto(comment.Text));
            }).WithName("UpdateComment");

            // Delete a comment
            commentsGroup.MapDelete("{commentId}", async (int movieId, int reviewId, int commentId, ForumDbContext dbContext) =>
            {
                var comment = await dbContext.Comments.Include(c => c.Review).ThenInclude(r => r.Movie)
                    .FirstOrDefaultAsync(c => c.Id == commentId && c.Review.Id == reviewId && c.Review.Movie.Id == movieId);
                if (comment == null) return Results.NotFound();

                dbContext.Comments.Remove(comment);
                await dbContext.SaveChangesAsync();

                return Results.NoContent();
            }).WithName("DeleteComment");
        }
        
        static IEnumerable<LinkDto> CreateCommentLinks(int movieId, int reviewId, int commentId, HttpContext httpContext, LinkGenerator linkGenerator)
        {
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "GetComment", new { movieId, reviewId, commentId }), "self", "GET");
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "UpdateComment", new { movieId, reviewId, commentId }), "update", "PUT");
            yield return new LinkDto(linkGenerator.GetUriByName(httpContext, "DeleteComment", new { movieId, reviewId, commentId }), "delete", "DELETE");
        }
    }
}
