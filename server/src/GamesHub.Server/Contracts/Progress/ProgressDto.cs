namespace GamesHub.Server.Contracts.Progress;

public record ProgressDto(string GameId, string LevelId, bool Completed, int BestMoves);
