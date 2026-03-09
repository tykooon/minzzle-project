using GamesHub.Server.Domain.Games;
using GamesHub.Server.Domain.Levels;

namespace GamesHub.Server.Storage.InMemory;

public class InMemoryStore
{
    public List<GameInfo> Games { get; } = [];
    public List<LevelRecord> Levels { get; } = [];
}
