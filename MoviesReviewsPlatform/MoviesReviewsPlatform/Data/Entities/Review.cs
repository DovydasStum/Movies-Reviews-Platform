namespace MoviesReviewsPlatform.Data.Entities
{
    public class Review
    {
        public int Id { get; set; }
        public required string Text { get; set; }
        public required int Evaluation { get; set; } 
        public required DateTime Date { get; set; }

        public required Movie Movie { get; set; }
        public int MovieId { get; set; }
        public List<Comment> Comments { get; set; } = new();
    }
    public record ReviewDto(int Id, string Text, int Evaluation,
        DateTime Date);
}
