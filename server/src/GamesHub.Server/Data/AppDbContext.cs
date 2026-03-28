using System.Text.Json;
using GamesHub.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamesHub.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameEntity> Games => Set<GameEntity>();
    public DbSet<LevelEntity> Levels => Set<LevelEntity>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // ── GameEntity ────────────────────────────────────────────────
        mb.Entity<GameEntity>(e =>
        {
            e.HasKey(g => g.Id);
            e.HasData(
                new GameEntity { Id = "minzzle-fives",      Name = "Minzzle Fives",      Description = "Cover every edge of the graph using moves of exactly 5 edges." },
                new GameEntity { Id = "minzzle-swipes",     Name = "Minzzle Swipes",     Description = "Slide rows and columns to restore the color grid." },
                new GameEntity { Id = "minzzle-swipes-hex", Name = "Minzzle Swipes Hex", Description = "Slide hexagonal lines to restore the color pattern." }
            );
        });

        // ── LevelEntity ───────────────────────────────────────────────
        mb.Entity<LevelEntity>(e =>
        {
            e.HasKey(l => l.Id);
            e.HasIndex(l => l.GameId);
            e.Property(l => l.NodesJson).HasColumnName("Nodes");
            e.Property(l => l.EdgesJson).HasColumnName("Edges");
            e.Property(l => l.SolutionJson).HasColumnName("Solution");
            e.Property(l => l.BoardJson).HasColumnName("Board");

            // Seed the 3 existing levels
            e.HasData(
                new LevelEntity
                {
                    Id = "level-001",
                    GameId = "minzzle-fives",
                    Name = "First Steps",
                    Difficulty = 1,
                    SchemaVersion = 1,
                    MoveLen = 5,
                    NodesJson = JsonSerializer.Serialize(new[]
                    {
                        new { id = 0, x = 0f, y = 0f }, new { id = 1, x = 1f, y = 0f },
                        new { id = 2, x = 2f, y = 0f }, new { id = 3, x = 3f, y = 0f },
                        new { id = 4, x = 0f, y = 1f }, new { id = 5, x = 1f, y = 1f },
                        new { id = 6, x = 2f, y = 1f }, new { id = 7, x = 3f, y = 1f },
                    }),
                    EdgesJson = JsonSerializer.Serialize(new[]
                    {
                        new { id = 0, a = 0, b = 1 }, new { id = 1, a = 1, b = 2 }, new { id = 2, a = 2, b = 3 },
                        new { id = 3, a = 4, b = 5 }, new { id = 4, a = 5, b = 6 }, new { id = 5, a = 6, b = 7 },
                        new { id = 6, a = 0, b = 4 }, new { id = 7, a = 1, b = 5 },
                        new { id = 8, a = 2, b = 6 }, new { id = 9, a = 3, b = 7 },
                    }),
                },
                new LevelEntity
                {
                    Id = "level-002",
                    GameId = "minzzle-fives",
                    Name = "Crossroads",
                    Difficulty = 2,
                    SchemaVersion = 1,
                    MoveLen = 5,
                    NodesJson = JsonSerializer.Serialize(new[]
                    {
                        new { id = 0, x = 0f, y = 0f }, new { id = 1, x = 1f, y = 0f }, new { id = 2, x = 2f, y = 0f },
                        new { id = 3, x = 0f, y = 1f }, new { id = 4, x = 1f, y = 1f }, new { id = 5, x = 2f, y = 1f },
                        new { id = 6, x = 0f, y = 2f }, new { id = 7, x = 1f, y = 2f }, new { id = 8, x = 2f, y = 2f },
                    }),
                    EdgesJson = JsonSerializer.Serialize(new[]
                    {
                        new { id = 0,  a = 0, b = 1 }, new { id = 1,  a = 1, b = 2 },
                        new { id = 2,  a = 3, b = 4 }, new { id = 3,  a = 4, b = 5 },
                        new { id = 4,  a = 6, b = 7 }, new { id = 5,  a = 7, b = 8 },
                        new { id = 6,  a = 0, b = 3 }, new { id = 7,  a = 1, b = 4 }, new { id = 8,  a = 2, b = 5 },
                        new { id = 9,  a = 3, b = 6 }, new { id = 10, a = 4, b = 7 }, new { id = 11, a = 5, b = 8 },
                        new { id = 12, a = 0, b = 4 }, new { id = 13, a = 1, b = 5 },
                        new { id = 14, a = 3, b = 7 }, new { id = 15, a = 4, b = 8 },
                        new { id = 16, a = 1, b = 3 }, new { id = 17, a = 2, b = 4 },
                        new { id = 18, a = 4, b = 6 }, new { id = 19, a = 5, b = 7 },
                    }),
                },
                new LevelEntity
                {
                    Id = "level-003",
                    GameId = "minzzle-fives",
                    Name = "Wide Grid",
                    Difficulty = 3,
                    SchemaVersion = 1,
                    MoveLen = 5,
                    NodesJson = JsonSerializer.Serialize(new[]
                    {
                        new { id = 0,  x = 0f, y = 0f }, new { id = 1,  x = 1f, y = 0f }, new { id = 2,  x = 2f, y = 0f },
                        new { id = 3,  x = 3f, y = 0f }, new { id = 4,  x = 4f, y = 0f },
                        new { id = 5,  x = 0f, y = 1f }, new { id = 6,  x = 1f, y = 1f }, new { id = 7,  x = 2f, y = 1f },
                        new { id = 8,  x = 3f, y = 1f }, new { id = 9,  x = 4f, y = 1f },
                        new { id = 10, x = 0f, y = 2f }, new { id = 11, x = 1f, y = 2f }, new { id = 12, x = 2f, y = 2f },
                        new { id = 13, x = 3f, y = 2f }, new { id = 14, x = 4f, y = 2f },
                    }),
                    EdgesJson = JsonSerializer.Serialize(new[]
                    {
                        new { id = 0,  a = 0,  b = 1  }, new { id = 1,  a = 1,  b = 2  },
                        new { id = 2,  a = 2,  b = 3  }, new { id = 3,  a = 3,  b = 4  },
                        new { id = 4,  a = 5,  b = 6  }, new { id = 5,  a = 6,  b = 7  },
                        new { id = 6,  a = 7,  b = 8  }, new { id = 7,  a = 8,  b = 9  },
                        new { id = 8,  a = 10, b = 11 }, new { id = 9,  a = 11, b = 12 },
                        new { id = 10, a = 12, b = 13 }, new { id = 11, a = 13, b = 14 },
                        new { id = 12, a = 0,  b = 5  }, new { id = 13, a = 1,  b = 6  },
                        new { id = 14, a = 2,  b = 7  }, new { id = 15, a = 3,  b = 8  }, new { id = 16, a = 4,  b = 9  },
                        new { id = 17, a = 5,  b = 10 }, new { id = 18, a = 6,  b = 11 },
                        new { id = 19, a = 7,  b = 12 }, new { id = 20, a = 8,  b = 13 }, new { id = 21, a = 9,  b = 14 },
                        new { id = 22, a = 0,  b = 6  }, new { id = 23, a = 2,  b = 8  }, new { id = 24, a = 7,  b = 11 },
                    }),
                },
                // ── Minzzle Swipes levels ─────────────────────────────
                new LevelEntity
                {
                    Id = "swipes-001", GameId = "minzzle-swipes", Name = "Tiny Quadrants",
                    Difficulty = 1, SchemaVersion = 1, MoveLen = 2,
                    NodesJson = "[]", EdgesJson = "[]",
                    BoardJson = JsonSerializer.Serialize(new
                    {
                        rows = 4, cols = 4,
                        solved = new[]
                        {
                            new[] { "#1255C8", "#1255C8", "#FFD500", "#FFD500" },
                            new[] { "#1255C8", "#1255C8", "#FFD500", "#FFD500" },
                            new[] { "#C8102E", "#C8102E", "#00873A", "#00873A" },
                            new[] { "#C8102E", "#C8102E", "#00873A", "#00873A" },
                        },
                        scrambleMoves = new object[]
                        {
                            new { type = "row", index = 1 },
                            new { type = "col", index = 2 },
                        },
                    }),
                },
                new LevelEntity
                {
                    Id = "swipes-002", GameId = "minzzle-swipes", Name = "Classic Quadrants",
                    Difficulty = 2, SchemaVersion = 1, MoveLen = 5,
                    NodesJson = "[]", EdgesJson = "[]",
                    BoardJson = JsonSerializer.Serialize(new
                    {
                        rows = 6, cols = 6,
                        solved = new[]
                        {
                            new[] { "#1255C8", "#1255C8", "#1255C8", "#FFD500", "#FFD500", "#FFD500" },
                            new[] { "#1255C8", "#1255C8", "#1255C8", "#FFD500", "#FFD500", "#FFD500" },
                            new[] { "#1255C8", "#1255C8", "#1255C8", "#FFD500", "#FFD500", "#FFD500" },
                            new[] { "#C8102E", "#C8102E", "#C8102E", "#00873A", "#00873A", "#00873A" },
                            new[] { "#C8102E", "#C8102E", "#C8102E", "#00873A", "#00873A", "#00873A" },
                            new[] { "#C8102E", "#C8102E", "#C8102E", "#00873A", "#00873A", "#00873A" },
                        },
                        scrambleMoves = new object[]
                        {
                            new { type = "row", index = 1 },
                            new { type = "col", index = 4 },
                            new { type = "row", index = 3 },
                            new { type = "col", index = 0 },
                            new { type = "row", index = 5 },
                        },
                    }),
                },
                new LevelEntity
                {
                    Id = "swipes-003", GameId = "minzzle-swipes", Name = "Tangled Quadrants",
                    Difficulty = 3, SchemaVersion = 1, MoveLen = 8,
                    NodesJson = "[]", EdgesJson = "[]",
                    BoardJson = JsonSerializer.Serialize(new
                    {
                        rows = 6, cols = 6,
                        solved = new[]
                        {
                            new[] { "#1255C8", "#1255C8", "#1255C8", "#FFD500", "#FFD500", "#FFD500" },
                            new[] { "#1255C8", "#1255C8", "#1255C8", "#FFD500", "#FFD500", "#FFD500" },
                            new[] { "#1255C8", "#1255C8", "#1255C8", "#FFD500", "#FFD500", "#FFD500" },
                            new[] { "#C8102E", "#C8102E", "#C8102E", "#00873A", "#00873A", "#00873A" },
                            new[] { "#C8102E", "#C8102E", "#C8102E", "#00873A", "#00873A", "#00873A" },
                            new[] { "#C8102E", "#C8102E", "#C8102E", "#00873A", "#00873A", "#00873A" },
                        },
                        scrambleMoves = new object[]
                        {
                            new { type = "row", index = 0 },
                            new { type = "col", index = 2 },
                            new { type = "row", index = 4 },
                            new { type = "col", index = 5 },
                            new { type = "row", index = 2 },
                            new { type = "col", index = 1 },
                            new { type = "row", index = 3 },
                            new { type = "col", index = 3 },
                        },
                    }),
                },
                // ── Minzzle Swipes Hex levels ─────────────────────────
                new LevelEntity
                {
                    Id = "hex-001", GameId = "minzzle-swipes-hex", Name = "Hex Intro",
                    Difficulty = 1, SchemaVersion = 1, MoveLen = 3,
                    NodesJson = "[]", EdgesJson = "[]",
                    BoardJson = JsonSerializer.Serialize(new
                    {
                        side = 2,
                        colors = new[] { "#1255C8", "#FFD500", "#00873A", "#C8102E", "#FF5800", "#FFFFFF" },
                        scrambleMoves = new object[]
                        {
                            new { axis = "horizontal", lineIndex = 1 },
                            new { axis = "diagL",      lineIndex = 2 },
                            new { axis = "diagR",      lineIndex = 0 },
                        },
                    }),
                },
                new LevelEntity
                {
                    Id = "hex-002", GameId = "minzzle-swipes-hex", Name = "Hex Medium",
                    Difficulty = 2, SchemaVersion = 1, MoveLen = 5,
                    NodesJson = "[]", EdgesJson = "[]",
                    BoardJson = JsonSerializer.Serialize(new
                    {
                        side = 3,
                        colors = new[] { "#1255C8", "#FFD500", "#00873A", "#C8102E", "#FF5800", "#FFFFFF" },
                        scrambleMoves = new object[]
                        {
                            new { axis = "horizontal", lineIndex = 2 },
                            new { axis = "diagR",      lineIndex = 3 },
                            new { axis = "diagL",      lineIndex = 1 },
                            new { axis = "horizontal", lineIndex = 4 },
                            new { axis = "diagR",      lineIndex = 1 },
                        },
                    }),
                },
                new LevelEntity
                {
                    Id = "hex-003", GameId = "minzzle-swipes-hex", Name = "Hex Challenge",
                    Difficulty = 3, SchemaVersion = 1, MoveLen = 8,
                    NodesJson = "[]", EdgesJson = "[]",
                    BoardJson = JsonSerializer.Serialize(new
                    {
                        side = 3,
                        colors = new[] { "#1255C8", "#FFD500", "#00873A", "#C8102E", "#FF5800", "#FFFFFF" },
                        scrambleMoves = new object[]
                        {
                            new { axis = "horizontal", lineIndex = 0 },
                            new { axis = "diagL",      lineIndex = 3 },
                            new { axis = "diagR",      lineIndex = 2 },
                            new { axis = "horizontal", lineIndex = 3 },
                            new { axis = "diagL",      lineIndex = 0 },
                            new { axis = "diagR",      lineIndex = 4 },
                            new { axis = "horizontal", lineIndex = 1 },
                            new { axis = "diagL",      lineIndex = 2 },
                        },
                    }),
                }
            );
        });
    }
}
