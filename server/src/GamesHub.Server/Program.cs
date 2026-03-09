using GamesHub.Server.Api.Games;
using GamesHub.Server.Api.Levels;
using GamesHub.Server.Api.Progress;
using GamesHub.Server.Data.Seed;
using GamesHub.Server.Services;
using GamesHub.Server.Storage.InMemory;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────────
builder.Services.AddSingleton<InMemoryStore>();
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

// ── Seed ──────────────────────────────────────────────────────────────
SeedData.Seed(app.Services.GetRequiredService<InMemoryStore>());

// ── Middleware ────────────────────────────────────────────────────────
app.UseCors("WebDev");

// ── Endpoints ─────────────────────────────────────────────────────────
app.MapGamesEndpoints();
app.MapLevelsEndpoints();
app.MapProgressEndpoints();

app.Run();
