# ── Build stage ───────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/GamesHub.Server/GamesHub.Server.csproj", "src/GamesHub.Server/"]
RUN dotnet restore "src/GamesHub.Server/GamesHub.Server.csproj"

COPY . .
RUN dotnet publish "src/GamesHub.Server/GamesHub.Server.csproj" \
    -c Release -o /app/publish --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5129
EXPOSE 5129

ENTRYPOINT ["dotnet", "GamesHub.Server.dll"]
