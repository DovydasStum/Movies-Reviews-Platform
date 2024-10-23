using Microsoft.EntityFrameworkCore;
using MoviesReviewsPlatform.Data;
using MoviesReviewsPlatform.Data.Entities;
using MoviesReviewsPlatform.Helpers;
using System.Globalization;

namespace MoviesReviewsPlatform.Auth
{
    public class SessionService(ForumDbContext dbContext)
    {

        public async Task CreateSessionAsync(Guid sessionId, string userId, string refreshToken, DateTime expiresAt)
        {
            dbContext.Sessions.Add(new Session
            {
                Id = sessionId,
                UserId = userId,
                InitiatedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt,
                LastRefreshToken = refreshToken.ToSHA256()
            });

            await dbContext.SaveChangesAsync();
        }

        public async Task ExtendedSessionAsync(Guid sessionId, string refreshToken, DateTime expiresAt)
        {
            var session = await dbContext.Sessions.FindAsync(sessionId);
            session.ExpiresAt = expiresAt;
            session.LastRefreshToken = refreshToken.ToSHA256();

            await dbContext.SaveChangesAsync();
        }

        public async Task InvalidateSessionAsync(Guid sessionId)
        {
            var session = await dbContext.Sessions.FindAsync (sessionId);
            if (session == null)
                return;

            session.IsRevoked = true;

            await dbContext.SaveChangesAsync();
        }

        public async Task<bool> IsSessionValidAsync(Guid sessionId, string refreshToken)
        {
            var session = await dbContext.Sessions.FindAsync(sessionId);
            return session != null && session.ExpiresAt > DateTimeOffset.UtcNow && !session.IsRevoked && session.LastRefreshToken == refreshToken.ToSHA256();
        }
    }
}
