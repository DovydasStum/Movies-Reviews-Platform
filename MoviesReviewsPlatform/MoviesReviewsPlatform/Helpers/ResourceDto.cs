namespace MoviesReviewsPlatform.Helpers;

public record ResourceDto<T>(T Resource, IReadOnlyCollection<LinkDto> Links);