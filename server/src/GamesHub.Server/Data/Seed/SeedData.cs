using GamesHub.Server.Domain.Games;
using GamesHub.Server.Domain.Levels;
using GamesHub.Server.Storage.InMemory;

namespace GamesHub.Server.Data.Seed;

public static class SeedData
{
    public static void Seed(InMemoryStore store)
    {
        store.Games.Add(new GameInfo(
            Id: "minzzle-fives",
            Name: "Minzzle Fives",
            Description: "Cover every edge of the graph using moves of exactly 5 edges.",
            LevelCount: 3
        ));

        // Level 001 — First Steps (4x2 grid, 10 edges, 2 moves)
        store.Levels.Add(new LevelRecord(
            Id: "level-001",
            GameId: "minzzle-fives",
            Name: "First Steps",
            Difficulty: 1,
            SchemaVersion: 1,
            MoveLen: 5,
            Nodes:
            [
                new(0, 0, 0), new(1, 1, 0), new(2, 2, 0), new(3, 3, 0),
                new(4, 0, 1), new(5, 1, 1), new(6, 2, 1), new(7, 3, 1),
            ],
            Edges:
            [
                new(0, 0, 1), new(1, 1, 2), new(2, 2, 3),   // top horizontal
                new(3, 4, 5), new(4, 5, 6), new(5, 6, 7),   // bottom horizontal
                new(6, 0, 4), new(7, 1, 5), new(8, 2, 6), new(9, 3, 7), // vertical
            ]
        ));

        // Level 002 — Crossroads (3x3 grid + diagonals, 20 edges, 4 moves)
        store.Levels.Add(new LevelRecord(
            Id: "level-002",
            GameId: "minzzle-fives",
            Name: "Crossroads",
            Difficulty: 2,
            SchemaVersion: 1,
            MoveLen: 5,
            Nodes:
            [
                new(0, 0, 0), new(1, 1, 0), new(2, 2, 0),
                new(3, 0, 1), new(4, 1, 1), new(5, 2, 1),
                new(6, 0, 2), new(7, 1, 2), new(8, 2, 2),
            ],
            Edges:
            [
                new(0, 0, 1), new(1, 1, 2),                   // horizontal row 0
                new(2, 3, 4), new(3, 4, 5),                   // horizontal row 1
                new(4, 6, 7), new(5, 7, 8),                   // horizontal row 2
                new(6, 0, 3), new(7, 1, 4), new(8, 2, 5),    // vertical col 0-2 top
                new(9, 3, 6), new(10, 4, 7), new(11, 5, 8),  // vertical col 0-2 bottom
                new(12, 0, 4), new(13, 1, 5),                 // diag top-left → bottom-right
                new(14, 3, 7), new(15, 4, 8),
                new(16, 1, 3), new(17, 2, 4),                 // diag top-right → bottom-left
                new(18, 4, 6), new(19, 5, 7),
            ]
        ));

        // Level 003 — Wide Grid (5x3 grid + 3 diagonals, 25 edges, 5 moves)
        store.Levels.Add(new LevelRecord(
            Id: "level-003",
            GameId: "minzzle-fives",
            Name: "Wide Grid",
            Difficulty: 3,
            SchemaVersion: 1,
            MoveLen: 5,
            Nodes:
            [
                new(0, 0, 0), new(1, 1, 0), new(2, 2, 0), new(3, 3, 0), new(4, 4, 0),
                new(5, 0, 1), new(6, 1, 1), new(7, 2, 1), new(8, 3, 1), new(9, 4, 1),
                new(10, 0, 2), new(11, 1, 2), new(12, 2, 2), new(13, 3, 2), new(14, 4, 2),
            ],
            Edges:
            [
                new(0, 0, 1), new(1, 1, 2), new(2, 2, 3), new(3, 3, 4),     // row 0
                new(4, 5, 6), new(5, 6, 7), new(6, 7, 8), new(7, 8, 9),     // row 1
                new(8, 10, 11), new(9, 11, 12), new(10, 12, 13), new(11, 13, 14), // row 2
                new(12, 0, 5), new(13, 1, 6), new(14, 2, 7), new(15, 3, 8), new(16, 4, 9),   // vert row 0→1
                new(17, 5, 10), new(18, 6, 11), new(19, 7, 12), new(20, 8, 13), new(21, 9, 14), // vert row 1→2
                new(22, 0, 6), new(23, 2, 8), new(24, 7, 11),               // 3 diagonals
            ]
        ));
    }
}
