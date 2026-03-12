namespace GamesHub.Server.Contracts.Levels;

public record SaveNodeRequest(int Id, float X, float Y);
public record SaveEdgeRequest(int Id, int A, int B);

public record SaveLevelRequest(
    string Name,
    int Difficulty,
    int SchemaVersion,
    int MoveLen,
    SaveNodeRequest[] Nodes,
    SaveEdgeRequest[] Edges
);
