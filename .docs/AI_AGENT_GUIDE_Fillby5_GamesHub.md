# AI Agent Guide: Games Hub + Fillby5 (Web MVP)

## Goal

Create a monorepo with:

-   ASP.NET Core server (Minimal API)
-   React + TypeScript web app
-   First game module: Fillby5

Fillby5 is a puzzle where the player must cover all admissible edges
using moves of exactly 5 edges per move.

Core rules: - Edges cannot be reused. - Nodes may repeat. - Dragging
back along the last edge undoes the last step. - Move auto-commits at 5
edges. - Cancel current move supported. - Undo last committed move
supported (MVP enabled). - Win when all edges are used.

Web-only in this phase.

------------------------------------------------------------------------

# Repo Structure

games-hub/ README.md .editorconfig .gitignore

server/ GamesHub.Server.sln src/ GamesHub.Server/ GamesHub.Server.csproj
Program.cs appsettings.json appsettings.Development.json Properties/
launchSettings.json

        Api/
          Games/
            GamesEndpoints.cs
          Levels/
            LevelsEndpoints.cs
          Progress/
            ProgressEndpoints.cs

        Domain/
          Games/
            GameInfo.cs
          Levels/
            LevelRecord.cs
            LevelSummary.cs
          Progress/
            ProgressRecord.cs

        Data/
          AppDbContext.cs
          Seed/
            SeedData.cs

        Contracts/
          Games/
            GameDto.cs
          Levels/
            LevelSummaryDto.cs
            LevelDto.cs
          Progress/
            ProgressDto.cs

        Services/
          GamesService.cs
          LevelsService.cs
          ProgressService.cs

        Storage/
          InMemory/
            InMemoryStore.cs

web/ package.json tsconfig.json vite.config.ts index.html src/ main.tsx
app/ App.tsx routes.tsx apiClient.ts layout/ Shell.tsx TopBar.tsx theme/
tokens.css global.css shared/ ui/ Button.tsx Card.tsx Toggle.tsx audio/
audioManager.ts utils/ clamp.ts rafThrottle.ts

      games/
        registry.ts
        fillby5/
          index.ts
          routes.tsx
          ui/
            Fillby5LevelsPage.tsx
            Fillby5PlayPage.tsx
            Fillby5Hud.tsx
          engine/
            types.ts
            graph.ts
            rules.ts
            reducer.ts
          render/
            canvasRenderer.ts
            viewTransform.ts
          input/
            hitTest.ts
            gestureController.ts
          levels/
            generators/
              rectGrid.ts
            samples/
              rect_6x8_level_001.json

------------------------------------------------------------------------

# API Endpoints

GET /api/games GET /api/games/{gameId}/levels GET
/api/games/{gameId}/levels/{levelId} GET /api/progress/{gameId} (stub)
POST /api/progress/{gameId}/{levelId} (stub)

------------------------------------------------------------------------

# Fillby5 Level Payload Schema

{ "schemaVersion": 1, "moveLen": 5, "nodes": \[{ "id": 0, "x": 0, "y": 0
}\], "edges": \[{ "id": 0, "a": 0, "b": 1 }\] }

Rules: - Edges are undirected. - edges.length must be divisible by
moveLen. - Only listed edges are admissible.

------------------------------------------------------------------------

# Fillby5 Engine Rules

GameState includes: - usedEdges: Set`<EdgeId>`{=html} - trailNodes:
NodeId\[\] - trailEdges: EdgeId\[\] - history: EdgeId\[\]\[\] -
moveLen - totalEdges

Step logic: 1. No edge between nodes → invalid 2. Backtrack if returning
to previous node 3. If edge in usedEdges → invalid 4. If edge already in
trailEdges → invalid 5. Else add edge 6. If trailEdges.length == moveLen
→ auto-commit

Auto-commit: - Add edges to usedEdges - Push to history - Clear trail -
Trigger feedback - Check win

------------------------------------------------------------------------

# Rendering (Canvas 2D)

Draw order: 1. Background 2. Admissible edges (thin grey) 3. Used edges
(thicker colored) 4. Preview edges (glow) 5. Nodes

Implement pan/zoom using transform matrix.

Snap to nearest node within fixed screen radius.

------------------------------------------------------------------------

# TODO Roadmap

Phase 0 -- Repo Bootstrap - Create folder structure - Init git

Phase 1 -- Server - Minimal API project - CORS for Vite - In-memory seed
with Fillby5 sample level

Phase 2 -- Web Shell - Vite + React + TS - Routing - Hub page

Phase 3 -- Fillby5 Module - Levels page - Play page - Engine
implementation

Phase 4 -- Canvas + Input - Renderer - Gesture controller - Engine
integration

Phase 5 -- UX Polish - Sound feedback - Optional vibration - Responsive
layout

------------------------------------------------------------------------

# Acceptance Criteria

-   Server returns games and levels.
-   Web hub shows Fillby5.
-   Play page allows:
    -   Drawing 5-edge moves
    -   Backtracking
    -   Auto-commit
    -   Cancel move
    -   Undo last move
    -   Win detection
