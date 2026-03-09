using GamesHub.Server.Services;

namespace GamesHub.Server.Api.Progress;

public static class ProgressEndpoints
{
    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/progress");

        group.MapGet("/{gameId}", (string gameId, ProgressService svc) =>
            Results.Ok(svc.GetProgress(gameId)));

        group.MapPost("/{gameId}/{levelId}", (string gameId, string levelId, SaveProgressRequest req, ProgressService svc) =>
            Results.Ok(svc.SaveProgress(gameId, levelId, req.Moves)));

        return app;
    }
}

public record SaveProgressRequest(int Moves);
