using GamesHub.Server.Services;

namespace GamesHub.Server.Api.Games;

public static class GamesEndpoints
{
    public static IEndpointRouteBuilder MapGamesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/games");

        group.MapGet("/", (GamesService svc) => Results.Ok(svc.GetAll()));

        group.MapGet("/{gameId}", (string gameId, GamesService svc) =>
        {
            var game = svc.GetById(gameId);
            return game is null ? Results.NotFound() : Results.Ok(game);
        });

        return app;
    }
}
