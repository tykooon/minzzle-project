using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;

namespace GamesHub.Server.Data.Seed;

/// <summary>
/// One-off export of the current Games + Levels (including Solution/Board payloads)
/// to a human-readable JSON snapshot that becomes the source of truth for seeding.
/// Invoked via <c>dotnet run -- export-seed [outputPath]</c>.
/// Reads whatever provider <see cref="AppDbContext"/> is configured for, so it can be
/// re-run after the Postgres cutover to refresh the snapshot from production data.
/// </summary>
public static class SeedExporter
{
    public static async Task RunAsync(IServiceProvider services, string outputPath)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var games = await db.Games.AsNoTracking()
            .OrderBy(g => g.Id)
            .ToListAsync();

        var levels = await db.Levels.AsNoTracking()
            .OrderBy(l => l.GameId).ThenBy(l => l.Id)
            .ToListAsync();

        static JsonNode? Raw(string? s) =>
            string.IsNullOrWhiteSpace(s) ? null : JsonNode.Parse(s);

        var snapshot = new JsonObject
        {
            ["games"] = new JsonArray(games.Select(g => (JsonNode)new JsonObject
            {
                ["id"] = g.Id,
                ["name"] = g.Name,
                ["description"] = g.Description,
            }).ToArray()),
            ["levels"] = new JsonArray(levels.Select(l => (JsonNode)new JsonObject
            {
                ["id"] = l.Id,
                ["gameId"] = l.GameId,
                ["name"] = l.Name,
                ["difficulty"] = l.Difficulty,
                ["schemaVersion"] = l.SchemaVersion,
                ["moveLen"] = l.MoveLen,
                ["nodes"] = Raw(l.NodesJson),
                ["edges"] = Raw(l.EdgesJson),
                ["solution"] = Raw(l.SolutionJson),
                ["board"] = Raw(l.BoardJson),
            }).ToArray()),
        };

        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        var json = snapshot.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(outputPath, json);

        var withSolution = levels.Count(l => !string.IsNullOrWhiteSpace(l.SolutionJson));
        Console.WriteLine(
            $"Exported {games.Count} games and {levels.Count} levels " +
            $"({withSolution} with solutions) to {outputPath}");
    }
}
