using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;

namespace GamesHub.Server.Api.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        // Start an OAuth login. Full-page redirect (not XHR) — the browser is sent to the
        // provider and, after the cookie is issued at the callback, back to returnUrl.
        group.MapGet("/login/{provider}", async (
            string provider,
            string? returnUrl,
            HttpContext http,
            IAuthenticationSchemeProvider schemes) =>
        {
            var scheme = SchemeFor(provider);
            if (scheme is null || await schemes.GetSchemeAsync(scheme) is null)
                return Results.BadRequest(new { error = $"Login provider '{provider}' is not available." });

            return Results.Challenge(
                new AuthenticationProperties { RedirectUri = SanitizeReturnUrl(returnUrl) },
                new[] { scheme });
        });

        group.MapPost("/logout", async (HttpContext http) =>
        {
            await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Ok();
        });

        // Current user. Always 200 with a valid JSON envelope so the client can parse it.
        group.MapGet("/me", (HttpContext http) =>
        {
            var user = http.User;
            if (user.Identity?.IsAuthenticated != true)
                return Results.Ok(new { authenticated = false, user = (object?)null });

            return Results.Ok(new
            {
                authenticated = true,
                user = (object?)new
                {
                    id = user.GetUserId(),
                    displayName = user.FindFirstValue(ClaimTypes.Name),
                    email = user.FindFirstValue(ClaimTypes.Email),
                    avatarUrl = user.FindFirstValue(AuthProvisioning.AvatarClaim),
                    isAdmin = user.FindFirstValue(AuthProvisioning.IsAdminClaim) == "true",
                },
            });
        });

        return app;
    }

    private static string? SchemeFor(string provider) => provider.ToLowerInvariant() switch
    {
        "google" => GoogleDefaults.AuthenticationScheme,
        "microsoft" => MicrosoftAccountDefaults.AuthenticationScheme,
        "facebook" => FacebookDefaults.AuthenticationScheme,
        _ => null,
    };

    // Only allow same-site relative paths to avoid open-redirect abuse.
    private static string SanitizeReturnUrl(string? returnUrl) =>
        !string.IsNullOrEmpty(returnUrl) && returnUrl.StartsWith('/') && !returnUrl.StartsWith("//")
            ? returnUrl
            : "/";
}

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(AuthProvisioning.UserIdClaim);
}
