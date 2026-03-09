using GamesHub.Server.Services;

namespace GamesHub.Server.Api.Levels;

public static class LevelsEndpoints
{
    public static IEndpointRouteBuilder MapLevelsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/games/{gameId}/levels");

        group.MapGet("/", (string gameId, LevelsService svc) =>
            Results.Ok(svc.GetSummaries(gameId)));

        group.MapGet("/{levelId}", (string gameId, string levelId, LevelsService svc) =>
        {
            var level = svc.GetById(gameId, levelId);
            return level is null ? Results.NotFound() : Results.Ok(level);
        });

        return app;
    }
}
