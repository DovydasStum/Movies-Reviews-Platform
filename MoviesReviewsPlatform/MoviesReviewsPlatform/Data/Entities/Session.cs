using MoviesReviewsPlatform.Auth.Model;

namespace MoviesReviewsPlatform.Data.Entities
{
    public class Session
    {
        public Guid Id { get; set; }
        public string LastRefreshToken { get; set; }
        public DateTimeOffset InitiatedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public string UserId { get; set; }
        public PlatformRestUser User { get; set; }


    }
}
