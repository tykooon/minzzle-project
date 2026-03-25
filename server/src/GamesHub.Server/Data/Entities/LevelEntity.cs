namespace GamesHub.Server.Data.Entities;

public class LevelEntity
{
    public string Id { get; set; } = string.Empty;
    public string GameId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Difficulty { get; set; }
    public int SchemaVersion { get; set; }
    public int MoveLen { get; set; }

    // Stored as JSON text columns
    public string NodesJson { get; set; } = "[]";
    public string EdgesJson { get; set; } = "[]";
    public string? SolutionJson { get; set; }
    public string? BoardJson { get; set; }
}
