using System.Security.Claims;
using GamesHub.Server.Api.Auth;
using GamesHub.Server.Services;

namespace GamesHub.Server.Api.Progress;

public static class ProgressEndpoints
{
    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/progress").RequireAuthorization();

        group.MapGet("/{gameId}", async (string gameId, ClaimsPrincipal user, ProgressService svc) =>
        {
            var userId = user.GetUserId();
            if (userId is null) return Results.Unauthorized();
            return Results.Ok(await svc.GetProgressAsync(userId, gameId));
        });

        group.MapPost("/{gameId}/{levelId}", async (
            string gameId, string levelId, SaveProgressRequest req, ClaimsPrincipal user, ProgressService svc) =>
        {
            var userId = user.GetUserId();
            if (userId is null) return Results.Unauthorized();
            return Results.Ok(await svc.SaveProgressAsync(userId, gameId, levelId, req.Moves));
        });

        return app;
    }
}

public record SaveProgressRequest(int Moves);
