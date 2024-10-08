using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MoviesReviewsPlatform.Auth.Model;
using MoviesReviewsPlatform.Data.Entities;

namespace MoviesReviewsPlatform.Data
{
    public class ForumDbContext : IdentityDbContext<PlatformRestUser>
    {
        private readonly IConfiguration _configuration;
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Comment> Comments { get; set; }

        public ForumDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(_configuration.GetConnectionString("PostgreSQL"));
        }
    }
}