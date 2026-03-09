using GamesHub.Server.Contracts.Progress;

namespace GamesHub.Server.Services;

// Stub — will be replaced with DB-backed implementation in Phase 4
public class ProgressService
{
    public IEnumerable<ProgressDto> GetProgress(string gameId) => [];

    public ProgressDto SaveProgress(string gameId, string levelId, int moves) =>
        new(gameId, levelId, Completed: true, BestMoves: moves);
}
