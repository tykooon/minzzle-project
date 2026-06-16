namespace GamesHub.Server.Data.Entities;

public class UserEntity
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastLoginAt { get; set; }

    public ICollection<UserLoginEntity> Logins { get; set; } = new List<UserLoginEntity>();
    public ICollection<UserProgressEntity> Progress { get; set; } = new List<UserProgressEntity>();
}
