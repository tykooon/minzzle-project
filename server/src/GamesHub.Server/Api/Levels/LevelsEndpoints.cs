using GamesHub.Server.Contracts.Levels;
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

        group.MapPost("/", (string gameId, SaveLevelRequest req, LevelsService svc) =>
        {
            var created = svc.CreateLevel(gameId, req);
            return Results.Created($"/api/games/{gameId}/levels/{created.Id}", created);
        });

        group.MapPut("/{levelId}", (string gameId, string levelId, SaveLevelRequest req, LevelsService svc) =>
        {
            var updated = svc.UpdateLevel(gameId, levelId, req);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        });

        group.MapPut("/{levelId}/solution", (string gameId, string levelId, SaveSolutionRequest req, LevelsService svc) =>
        {
            var updated = svc.SaveSolution(gameId, levelId, req.SolutionJson);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        });

        group.MapDelete("/{levelId}", (string gameId, string levelId, LevelsService svc) =>
        {
            var deleted = svc.DeleteLevel(gameId, levelId);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        return app;
    }
}
