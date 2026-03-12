# CLAUDE.md — Minzzle Project

## Project Overview
Minzzle is a web-based puzzle game hub. Currently hosts one game: **Minzzle Fives** — a graph/node-based puzzle game rendered on an HTML5 canvas.

- **Domain**: minzzle.com
- **VPS**: 187.124.95.3 (Ubuntu 24 LTS), Nginx + Docker
- **Repo structure**: monorepo (`/server` + `/web` + `/deploy`)

---

## Stack

### Backend — `/server`
- **.NET 9** Minimal APIs (C#)
- **No database** — in-memory store only (`InMemoryStore.cs`), seeded at startup
- **No auth** — public API
- **Port**: 5129
- Entry: `server/src/GamesHub.Server/Program.cs`

### Frontend — `/web`
- **React 18** + **TypeScript 5** + **Vite 5**
- **TailwindCSS 3** + **shadcn/ui** (Radix UI primitives, components in `web/src/components/ui/`)
- **React Router 6** (client-side routing)
- **TanStack Query v5** (data fetching)
- **React Hook Form** + **Zod** (forms/validation)
- **Lucide React** (icons), **Sonner** (toasts)
- Dev server on **port 8080**, proxies `/api/*` → `localhost:5129`
- Entry: `web/src/main.tsx` → `App.tsx`

---

## Key Folder Structure

```
/server/src/GamesHub.Server/
  Program.cs          # DI, middleware, endpoint mapping
  Api/                # Endpoint handlers (Games, Levels, Progress)
  Domain/             # Domain models
  Contracts/          # DTOs
  Services/           # Business logic
  Storage/InMemory/   # InMemoryStore.cs
  Data/Seed/          # SeedData.cs (3 hardcoded levels)

/web/src/
  main.tsx            # React entry
  App.tsx             # Router + providers
  pages/              # HubPage, MinzzleFivesLevelsPage, MinzzleFivesPlayPage
  components/ui/      # 40+ shadcn components
  games/minzzle-fives/
    engine/           # Game reducer, types, graph logic
    render/           # Canvas 2D renderer, hit testing
    input/            # Gesture hooks (mouse + touch)
    levels/           # Sample level JSON
  hooks/              # use-toast, use-mobile
  lib/
    apiClient.ts      # Fetch wrapper + API calls
    utils.ts

/deploy/
  docker-compose.yml  # Production container setup
  nginx.conf          # Nginx reverse proxy + SSL
  setup-vps.sh        # VPS initial setup script
  dev.bat             # Start backend + frontend locally (Windows)
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/games` | List all games |
| GET | `/api/games/{gameId}` | Game details |
| GET | `/api/games/{gameId}/levels` | Level list |
| GET | `/api/games/{gameId}/levels/{levelId}` | Full level data |
| GET | `/api/progress/{gameId}` | Progress (stub) |
| POST | `/api/progress/{gameId}/{levelId}` | Save progress (stub) |

---

## Local Dev

```bat
deploy\dev.bat
```
Opens two terminal windows: backend (`dotnet run`) and frontend (`npm run dev`).

- Frontend: http://localhost:8080
- Backend: http://localhost:5129

---

## Production Deploy
CI/CD via GitHub Actions on push to `main`:
1. Builds Docker image → pushes to `ghcr.io`
2. Builds React (`npm run build`) → rsyncs `web/dist/` to VPS
3. SSH to VPS → `docker compose pull && docker compose up -d`

Nginx serves static files from `/var/www/minzzle/web/`, proxies `/api/` to Docker container.

---

## Docs
- `.docs/dev-and-deploy-guide.md` — full infra/setup guide
- `.docs/AI_AGENT_GUIDE_Fillby5_GamesHub.md` — game rules, engine spec, API spec
