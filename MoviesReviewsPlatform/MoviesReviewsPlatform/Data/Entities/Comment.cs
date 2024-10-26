using MoviesReviewsPlatform.Auth.Model;

namespace MoviesReviewsPlatform.Data.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public required string Text { get; set; }
        public required DateTime Date { get; set; }
        public required Review Review { get; set; }


        public required string UserId { get; set; }
        public PlatformRestUser User { get; set; }
    }
    public record CommentDto(int Id, string Text, DateTime Date);
}
