namespace GamesHub.Server.Data.Entities;

public class UserProgressEntity
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string GameId { get; set; } = string.Empty;
    public string LevelId { get; set; } = string.Empty;
    public bool Completed { get; set; }
    public int BestMoves { get; set; }
    public DateTime UpdatedAt { get; set; }

    public UserEntity? User { get; set; }
}
