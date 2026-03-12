using GamesHub.Server.Api.Games;
using GamesHub.Server.Api.Levels;
using GamesHub.Server.Api.Progress;
using GamesHub.Server.Data;
using GamesHub.Server.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Database ───────────────────────────────────────────────────────────
Directory.CreateDirectory("data");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Services ──────────────────────────────────────────────────────────
builder.Services.AddScoped<GamesService>();
builder.Services.AddScoped<LevelsService>();
builder.Services.AddScoped<ProgressService>();

// ── CORS ──────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:8080"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("WebDev", policy =>
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// ── Migrate DB ────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

// ── Middleware ────────────────────────────────────────────────────────
app.UseCors("WebDev");

// ── Endpoints ─────────────────────────────────────────────────────────
app.MapGamesEndpoints();
app.MapLevelsEndpoints();
app.MapProgressEndpoints();

app.Run();
