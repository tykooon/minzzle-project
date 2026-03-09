namespace GamesHub.Server.Domain.Progress;

public record ProgressRecord(string GameId, string LevelId, bool Completed, int BestMoves);
