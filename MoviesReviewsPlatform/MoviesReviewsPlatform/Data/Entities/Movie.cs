using MoviesReviewsPlatform.Auth.Model;

namespace MoviesReviewsPlatform.Data.Entities
{
    public class Movie
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string Director { get; set; }
        public required string Actors { get; set; }
        public required int ReleaseYear { get; set; }
        public required TimeSpan Duration { get; set; }
        public required string Genre { get; set; }
        
        public List<Review> Reviews { get; set; } = new();


        public required string UserId {  get; set; }    
        public PlatformRestUser User { get; set; }  

    }

    public record MovieDto(int Id, string Name, string Description,
                        string Director, string Actors, int ReleaseYear,
                        TimeSpan Duration, string Genre);
}
