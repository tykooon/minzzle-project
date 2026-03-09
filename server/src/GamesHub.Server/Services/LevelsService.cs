using GamesHub.Server.Contracts.Levels;
using GamesHub.Server.Storage.InMemory;

namespace GamesHub.Server.Services;

public class LevelsService(InMemoryStore store)
{
    public IEnumerable<LevelSummaryDto> GetSummaries(string gameId) =>
        store.Levels
            .Where(l => l.GameId == gameId)
            .Select(l => new LevelSummaryDto(
                l.Id, l.Name, l.Difficulty, l.Edges.Length,
                EstimatedMoves: l.Edges.Length / l.MoveLen
            ));

    public LevelDto? GetById(string gameId, string levelId) =>
        store.Levels
            .Where(l => l.GameId == gameId && l.Id == levelId)
            .Select(l => new LevelDto(
                l.Id, l.Name, l.Difficulty, l.SchemaVersion, l.MoveLen,
                Nodes: l.Nodes.Select(n => new NodeDto(n.Id, n.X, n.Y)).ToArray(),
                Edges: l.Edges.Select(e => new EdgeDto(e.Id, e.A, e.B)).ToArray()
            ))
            .FirstOrDefault();
}
