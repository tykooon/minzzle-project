using System.Text.Json;
using GamesHub.Server.Contracts.Levels;
using GamesHub.Server.Data;
using GamesHub.Server.Data.Entities;

namespace GamesHub.Server.Services;

public class LevelsService(AppDbContext db)
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    private static NodeDto[] DeserNodes(string json) =>
        JsonSerializer.Deserialize<NodeDto[]>(json, JsonOpts) ?? [];

    private static EdgeDto[] DeserEdges(string json) =>
        JsonSerializer.Deserialize<EdgeDto[]>(json, JsonOpts) ?? [];

    public IEnumerable<LevelSummaryDto> GetSummaries(string gameId) =>
        db.Levels
            .Where(l => l.GameId == gameId)
            .AsEnumerable()
            .Select(l =>
            {
                var edges = DeserEdges(l.EdgesJson);
                return new LevelSummaryDto(
                    l.Id, l.Name, l.Difficulty,
                    EdgeCount: edges.Length,
                    EstimatedMoves: edges.Length / l.MoveLen
                );
            });

    public LevelDto? GetById(string gameId, string levelId)
    {
        var l = db.Levels.FirstOrDefault(l => l.GameId == gameId && l.Id == levelId);
        return l is null ? null : MapToDto(l);
    }

    public LevelDto CreateLevel(string gameId, SaveLevelRequest req)
    {
        var entity = new LevelEntity
        {
            Id = Guid.NewGuid().ToString("N")[..12],
            GameId = gameId,
            Name = req.Name,
            Difficulty = req.Difficulty,
            SchemaVersion = req.SchemaVersion,
            MoveLen = req.MoveLen,
            NodesJson = JsonSerializer.Serialize(req.Nodes, JsonOpts),
            EdgesJson = JsonSerializer.Serialize(req.Edges, JsonOpts),
        };
        db.Levels.Add(entity);
        db.SaveChanges();
        return MapToDto(entity);
    }

    public LevelDto? UpdateLevel(string gameId, string levelId, SaveLevelRequest req)
    {
        var entity = db.Levels.FirstOrDefault(l => l.GameId == gameId && l.Id == levelId);
        if (entity is null) return null;

        entity.Name = req.Name;
        entity.Difficulty = req.Difficulty;
        entity.SchemaVersion = req.SchemaVersion;
        entity.MoveLen = req.MoveLen;
        entity.NodesJson = JsonSerializer.Serialize(req.Nodes, JsonOpts);
        entity.EdgesJson = JsonSerializer.Serialize(req.Edges, JsonOpts);
        db.SaveChanges();
        return MapToDto(entity);
    }

    public bool DeleteLevel(string gameId, string levelId)
    {
        var entity = db.Levels.FirstOrDefault(l => l.GameId == gameId && l.Id == levelId);
        if (entity is null) return false;
        db.Levels.Remove(entity);
        db.SaveChanges();
        return true;
    }

    private LevelDto MapToDto(LevelEntity l) =>
        new(l.Id, l.Name, l.Difficulty, l.SchemaVersion, l.MoveLen,
            Nodes: DeserNodes(l.NodesJson),
            Edges: DeserEdges(l.EdgesJson));
}
