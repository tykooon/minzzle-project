using GamesHub.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamesHub.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<GameEntity> Games => Set<GameEntity>();
    public DbSet<LevelEntity> Levels => Set<LevelEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<UserLoginEntity> UserLogins => Set<UserLoginEntity>();
    public DbSet<UserProgressEntity> UserProgress => Set<UserProgressEntity>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // ── GameEntity ────────────────────────────────────────────────
        // Seed data is loaded at runtime from Data/Seed/levels.snapshot.json
        // (see DbSeeder) rather than HasData, so admin-authored levels and
        // saved solutions survive provider changes.
        mb.Entity<GameEntity>(e =>
        {
            e.HasKey(g => g.Id);
        });

        // ── LevelEntity ───────────────────────────────────────────────
        mb.Entity<LevelEntity>(e =>
        {
            e.HasKey(l => l.Id);
            e.HasIndex(l => l.GameId);
            e.Property(l => l.NodesJson).HasColumnName("Nodes");
            e.Property(l => l.EdgesJson).HasColumnName("Edges");
            e.Property(l => l.SolutionJson).HasColumnName("Solution");
            e.Property(l => l.BoardJson).HasColumnName("Board");
        });

        // ── UserEntity ────────────────────────────────────────────────
        mb.Entity<UserEntity>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email);
            e.Property(u => u.Email).IsRequired();
        });

        // ── UserLoginEntity ───────────────────────────────────────────
        mb.Entity<UserLoginEntity>(e =>
        {
            e.HasKey(x => new { x.Provider, x.ProviderKey });
            e.HasOne(x => x.User)
                .WithMany(u => u.Logins)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserProgressEntity ────────────────────────────────────────
        mb.Entity<UserProgressEntity>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => new { p.UserId, p.GameId, p.LevelId }).IsUnique();
            e.HasOne(p => p.User)
                .WithMany(u => u.Progress)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
