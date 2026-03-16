namespace GamesHub.Server.Contracts.Levels;

public record NodeDto(int Id, float X, float Y);
public record EdgeDto(int Id, int A, int B);

public record LevelDto(
    string Id,
    string Name,
    int Difficulty,
    int SchemaVersion,
    int MoveLen,
    NodeDto[] Nodes,
    EdgeDto[] Edges,
    string? SolutionJson
);
