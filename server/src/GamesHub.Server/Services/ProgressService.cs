using GamesHub.Server.Contracts.Progress;
using GamesHub.Server.Data;
using GamesHub.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamesHub.Server.Services;

public class ProgressService(AppDbContext db)
{
    public async Task<IEnumerable<ProgressDto>> GetProgressAsync(string userId, string gameId) =>
        await db.UserProgress
            .Where(p => p.UserId == userId && p.GameId == gameId)
            .Select(p => new ProgressDto(p.GameId, p.LevelId, p.Completed, p.BestMoves))
            .ToListAsync();

    public async Task<ProgressDto> SaveProgressAsync(string userId, string gameId, string levelId, int moves)
    {
        var existing = await db.UserProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.GameId == gameId && p.LevelId == levelId);

        if (existing is null)
        {
            existing = new UserProgressEntity
            {
                Id = Guid.NewGuid().ToString("N")[..12],
                UserId = userId,
                GameId = gameId,
                LevelId = levelId,
                Completed = true,
                BestMoves = moves,
                UpdatedAt = DateTime.UtcNow,
            };
            db.UserProgress.Add(existing);
        }
        else
        {
            existing.Completed = true;
            // Keep the fewest moves seen so far.
            if (moves < existing.BestMoves)
                existing.BestMoves = moves;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return new ProgressDto(existing.GameId, existing.LevelId, existing.Completed, existing.BestMoves);
    }
}
