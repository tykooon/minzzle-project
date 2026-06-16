namespace GamesHub.Server.Data.Entities;

/// <summary>
/// Links an external OAuth identity (provider + subject) to a local user account.
/// Composite key (Provider, ProviderKey) keeps each external identity unique and lets
/// a single user link multiple providers over time.
/// </summary>
public class UserLoginEntity
{
    public string Provider { get; set; } = string.Empty;     // "Google" | "Microsoft" | "Facebook"
    public string ProviderKey { get; set; } = string.Empty;  // OAuth subject / NameIdentifier
    public string UserId { get; set; } = string.Empty;

    public UserEntity? User { get; set; }
}
