namespace GamesHub.Server.Domain.Levels;

public record LevelSummary(string Id, string GameId, string Name, int Difficulty, int EdgeCount, int EstimatedMoves);
