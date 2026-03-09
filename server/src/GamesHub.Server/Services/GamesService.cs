using GamesHub.Server.Contracts.Games;
using GamesHub.Server.Storage.InMemory;

namespace GamesHub.Server.Services;

public class GamesService(InMemoryStore store)
{
    public IEnumerable<GameDto> GetAll() =>
        store.Games.Select(g => new GameDto(g.Id, g.Name, g.Description, g.LevelCount));

    public GameDto? GetById(string gameId) =>
        store.Games
            .Where(g => g.Id == gameId)
            .Select(g => new GameDto(g.Id, g.Name, g.Description, g.LevelCount))
            .FirstOrDefault();
}
