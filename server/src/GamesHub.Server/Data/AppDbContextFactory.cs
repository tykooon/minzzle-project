using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GamesHub.Server.Data;

/// <summary>
/// Design-time factory used by the EF Core CLI (<c>dotnet ef migrations ...</c>).
/// Migrations target PostgreSQL (production). No live database is required to generate
/// them, so the connection string here is a placeholder.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=minzzle;Username=postgres;Password=postgres")
            .Options;
        return new AppDbContext(options);
    }
}
