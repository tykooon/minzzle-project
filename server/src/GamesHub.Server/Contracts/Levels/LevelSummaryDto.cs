namespace GamesHub.Server.Contracts.Levels;

public record LevelSummaryDto(string Id, string Name, int Difficulty, int EdgeCount, int EstimatedMoves);
