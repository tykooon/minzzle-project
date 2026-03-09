namespace GamesHub.Server.Domain.Levels;

public record NodeData(int Id, float X, float Y);
public record EdgeData(int Id, int A, int B);

public record LevelRecord(
    string Id,
    string GameId,
    string Name,
    int Difficulty,
    int SchemaVersion,
    int MoveLen,
    NodeData[] Nodes,
    EdgeData[] Edges
);
