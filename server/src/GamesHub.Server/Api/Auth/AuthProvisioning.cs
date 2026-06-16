using System.Security.Claims;
using System.Text.Json;
using GamesHub.Server.Data;
using GamesHub.Server.Data.Entities;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;

namespace GamesHub.Server.Api.Auth;

/// <summary>
/// Shared OAuth <c>OnCreatingTicket</c> handler: upserts the local user + external login,
/// applies the admin allowlist, and stamps the cookie principal with internal claims
/// (<c>user_id</c>, <c>is_admin</c>, <c>avatar_url</c>) used by the rest of the API.
/// </summary>
public static class AuthProvisioning
{
    public const string UserIdClaim = "user_id";
    public const string IsAdminClaim = "is_admin";
    public const string AvatarClaim = "avatar_url";

    public static async Task OnCreatingTicketAsync(OAuthCreatingTicketContext ctx, string provider)
    {
        var services = ctx.HttpContext.RequestServices;
        var db = services.GetRequiredService<AppDbContext>();
        var config = services.GetRequiredService<IConfiguration>();

        var principal = ctx.Principal
            ?? throw new InvalidOperationException("OAuth principal was not provided.");

        var providerKey = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException($"{provider} did not return a subject id.");
        var email = principal.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var name = principal.FindFirstValue(ClaimTypes.Name)
            ?? (string.IsNullOrEmpty(email) ? provider + " user" : email);
        var avatar = ExtractAvatar(ctx.User, provider);

        var adminEmails = config.GetSection("Auth:AdminEmails").Get<string[]>() ?? [];
        var isAdmin = !string.IsNullOrEmpty(email)
            && adminEmails.Contains(email, StringComparer.OrdinalIgnoreCase);

        // Find an existing external login, else link to a same-email account, else create.
        var login = await db.UserLogins
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Provider == provider && l.ProviderKey == providerKey);

        UserEntity user;
        if (login is not null)
        {
            user = login.User!;
        }
        else
        {
            user = (!string.IsNullOrEmpty(email)
                ? await db.Users.FirstOrDefaultAsync(u => u.Email == email)
                : null)!;

            if (user is null)
            {
                user = new UserEntity
                {
                    Id = Guid.NewGuid().ToString("N")[..12],
                    Email = email,
                    DisplayName = name,
                    AvatarUrl = avatar,
                    CreatedAt = DateTime.UtcNow,
                };
                db.Users.Add(user);
            }

            db.UserLogins.Add(new UserLoginEntity
            {
                Provider = provider,
                ProviderKey = providerKey,
                UserId = user.Id,
            });
        }

        // Refresh profile fields on every sign-in.
        if (!string.IsNullOrWhiteSpace(name)) user.DisplayName = name;
        if (!string.IsNullOrWhiteSpace(email)) user.Email = email;
        if (!string.IsNullOrWhiteSpace(avatar)) user.AvatarUrl = avatar;
        user.IsAdmin = isAdmin;
        user.LastLoginAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        // Stamp internal claims onto the principal that will be persisted in the cookie.
        var identity = (ClaimsIdentity)principal.Identity!;
        identity.AddClaim(new Claim(UserIdClaim, user.Id));
        identity.AddClaim(new Claim(IsAdminClaim, user.IsAdmin ? "true" : "false"));
        if (!string.IsNullOrWhiteSpace(user.AvatarUrl) && principal.FindFirst(AvatarClaim) is null)
            identity.AddClaim(new Claim(AvatarClaim, user.AvatarUrl));
    }

    /// <summary>Pulls an avatar URL out of the provider's user-info JSON, where available.</summary>
    private static string? ExtractAvatar(JsonElement user, string provider)
    {
        try
        {
            return provider switch
            {
                "Google" => user.TryGetProperty("picture", out var p) ? p.GetString() : null,
                "Facebook" when user.TryGetProperty("picture", out var p)
                    && p.TryGetProperty("data", out var d)
                    && d.TryGetProperty("url", out var u) => u.GetString(),
                _ => null,
            };
        }
        catch
        {
            return null;
        }
    }
}
