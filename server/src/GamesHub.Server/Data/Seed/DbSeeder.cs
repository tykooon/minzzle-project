using System.Text.Json.Nodes;
using GamesHub.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamesHub.Server.Data.Seed;

/// <summary>
/// Seeds Games + Levels from the embedded <c>levels.snapshot.json</c> the first time the
/// database is empty. Replaces EF <c>HasData</c> seeding so that admin-authored levels and
/// saved solutions (captured in the snapshot) are preserved across a provider change.
/// Idempotent: if any levels already exist, it does nothing.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (await db.Levels.AnyAsync())
            return; // already seeded

        var json = ReadSnapshot();
        if (json is null)
        {
            logger.LogWarning("Seed snapshot not found; database left empty.");
            return;
        }

        var snap = JsonNode.Parse(json)!.AsObject();

        foreach (var node in snap["games"]!.AsArray())
        {
            var g = node!.AsObject();
            db.Games.Add(new GameEntity
            {
                Id = (string)g["id"]!,
                Name = (string)g["name"]!,
                Description = (string)g["description"]!,
            });
        }

        foreach (var node in snap["levels"]!.AsArray())
        {
            var l = node!.AsObject();
            db.Levels.Add(new LevelEntity
            {
                Id = (string)l["id"]!,
                GameId = (string)l["gameId"]!,
                Name = (string)l["name"]!,
                Difficulty = (int)l["difficulty"]!,
                SchemaVersion = (int)l["schemaVersion"]!,
                MoveLen = (int)l["moveLen"]!,
                NodesJson = l["nodes"]?.ToJsonString() ?? "[]",
                EdgesJson = l["edges"]?.ToJsonString() ?? "[]",
                SolutionJson = l["solution"]?.ToJsonString(),
                BoardJson = l["board"]?.ToJsonString(),
            });
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Seeded database from snapshot: {Games} games, {Levels} levels.",
            snap["games"]!.AsArray().Count, snap["levels"]!.AsArray().Count);
    }

    private static string? ReadSnapshot()
    {
        var asm = typeof(DbSeeder).Assembly;
        var resourceName = asm.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("levels.snapshot.json", StringComparison.OrdinalIgnoreCase));
        if (resourceName is null)
            return null;

        using var stream = asm.GetManifestResourceStream(resourceName)!;
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
