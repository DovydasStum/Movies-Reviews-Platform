namespace MoviesReviewsPlatform.Auth.Model
{
    public class PlatformRoles
    {
        public const string Admin = nameof(Admin);
        public const string PlatformUser = nameof(PlatformUser);

        public static readonly IReadOnlyCollection<string> All = new[] {Admin, PlatformUser};  
    }
}
