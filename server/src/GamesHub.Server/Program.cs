using GamesHub.Server.Api.Auth;
using GamesHub.Server.Api.Games;
using GamesHub.Server.Api.Levels;
using GamesHub.Server.Api.Progress;
using GamesHub.Server.Data;
using GamesHub.Server.Data.Seed;
using GamesHub.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Database ───────────────────────────────────────────────────────────
// Production runs on PostgreSQL; local dev uses SQLite (no external infra).
// Provider is selected by config: "Database:Provider" = Postgres | Sqlite.
var dbProvider = builder.Configuration["Database:Provider"] ?? "Postgres";
var useSqlite = dbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase);
if (useSqlite)
    Directory.CreateDirectory("data");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");
    if (useSqlite)
        options.UseSqlite(conn);
    else
        options.UseNpgsql(conn);
});

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
            .AllowAnyMethod()
            .AllowCredentials()); // required so the session cookie is accepted cross-port in dev
});

// ── Authentication (cookie session + social OAuth) ────────────────────
var authBuilder = builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddCookie(options =>
    {
        options.Cookie.Name = "minzzle.auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax; // works with top-level OAuth redirects
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
        options.SlidingExpiration = true;
        // This is an API, not an MVC app: return status codes instead of redirecting.
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

// Each provider is registered only when its credentials are configured, so the app
// runs (and other providers work) even if some secrets are missing.
var googleId = builder.Configuration["Authentication:Google:ClientId"];
if (!string.IsNullOrWhiteSpace(googleId))
{
    authBuilder.AddGoogle(o =>
    {
        o.ClientId = googleId;
        o.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        o.CallbackPath = "/api/auth/signin-google";
        o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        o.Events.OnCreatingTicket = ctx => AuthProvisioning.OnCreatingTicketAsync(ctx, "Google");
    });
}

var microsoftId = builder.Configuration["Authentication:Microsoft:ClientId"];
if (!string.IsNullOrWhiteSpace(microsoftId))
{
    authBuilder.AddMicrosoftAccount(o =>
    {
        o.ClientId = microsoftId;
        o.ClientSecret = builder.Configuration["Authentication:Microsoft:ClientSecret"]!;
        o.CallbackPath = "/api/auth/signin-microsoft";
        o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        o.Events.OnCreatingTicket = ctx => AuthProvisioning.OnCreatingTicketAsync(ctx, "Microsoft");
    });
}

var facebookId = builder.Configuration["Authentication:Facebook:AppId"];
if (!string.IsNullOrWhiteSpace(facebookId))
{
    authBuilder.AddFacebook(o =>
    {
        o.AppId = facebookId;
        o.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"]!;
        o.CallbackPath = "/api/auth/signin-facebook";
        o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        o.Fields.Add("name");
        o.Fields.Add("email");
        o.Fields.Add("picture");
        o.Events.OnCreatingTicket = ctx => AuthProvisioning.OnCreatingTicketAsync(ctx, "Facebook");
    });
}

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireClaim(AuthProvisioning.IsAdminClaim, "true"));
});

// Trust the reverse proxy (nginx) so OAuth redirect URIs are built with https.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// ── Initialise + seed DB ──────────────────────────────────────────────
// Postgres (prod) applies migrations; SQLite (dev) builds the schema from the
// model via EnsureCreated. Either way the snapshot seeder fills an empty DB.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (useSqlite)
        db.Database.EnsureCreated();
    else
        db.Database.Migrate();
}
await DbSeeder.SeedAsync(app.Services, app.Logger);

// ── One-off: export current Games+Levels to a JSON seed snapshot ───────
if (args.Length > 0 && args[0] == "export-seed")
{
    var outPath = args.Length > 1
        ? args[1]
        : Path.Combine(Directory.GetCurrentDirectory(), "Data", "Seed", "levels.snapshot.json");
    await SeedExporter.RunAsync(app.Services, Path.GetFullPath(outPath));
    return;
}

// ── Middleware ────────────────────────────────────────────────────────
app.UseForwardedHeaders();
app.UseCors("WebDev");
app.UseAuthentication();
app.UseAuthorization();

// ── Endpoints ─────────────────────────────────────────────────────────
app.MapAuthEndpoints();
app.MapGamesEndpoints();
app.MapLevelsEndpoints();
app.MapProgressEndpoints();

app.Run();
