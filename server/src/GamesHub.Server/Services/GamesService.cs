using GamesHub.Server.Contracts.Games;
using GamesHub.Server.Data;

namespace GamesHub.Server.Services;

public class GamesService(AppDbContext db)
{
    public IEnumerable<GameDto> GetAll() =>
        db.Games
            .Select(g => new GameDto(
                g.Id, g.Name, g.Description,
                db.Levels.Count(l => l.GameId == g.Id)))
            .ToList();

    public GameDto? GetById(string gameId) =>
        db.Games
            .Where(g => g.Id == gameId)
            .Select(g => new GameDto(
                g.Id, g.Name, g.Description,
                db.Levels.Count(l => l.GameId == g.Id)))
            .FirstOrDefault();
}
