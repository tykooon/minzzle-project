# Minzzle Games Implementation Spec
## For AI Coding Agents (Lovable / Codex / Claude Code)

Version: 1.0  
Portal brand: **www.minzzle.com**  
Games covered:
1. **Minzzle Fives**
2. **Minzzle Swipes**
3. **Minzzle Swipes Hex**

This document is written as an implementation brief for AI coding agents.  
It is intended to be copied into a repo and used as a build plan, architecture spec, and delivery pipeline.

---

# 1. Product Context

## 1.1 Portal concept

Build a single game portal under **www.minzzle.com**.

The portal hosts multiple puzzle games sharing:
- one visual style
- one shell / layout system
- one account / progress model
- one level-delivery API
- one deployment pipeline

The first games are:

- **Minzzle Fives**
- **Minzzle Swipes**
- **Minzzle Swipes Hex**

---

# 2. Technology Direction

## 2.1 Web stack

Use:

- **Frontend:** React + TypeScript + Vite
- **Backend:** ASP.NET Core (.NET 8) Minimal API
- **Styling:** shared CSS tokens / lightweight design system
- **Rendering:** Canvas 2D for game boards
- **Persistence:** start with in-memory / JSON seed, later move to DB
- **Deployment target:** one portal site with server API and static web app

## 2.2 Monorepo structure

Create a monorepo:

```text
minzzle/
  README.md
  docs/
    MINZZLE_GAMES_SPEC.md   <-- this document
  server/
    Minzzle.Server.sln
    src/
      Minzzle.Server/
  web/
    package.json
    src/
      app/
      shared/
      games/
        minzzle-fives/
        minzzle-swipes/
        minzzle-swipes-hex/
```

---

# 3. Shared Portal Requirements

## 3.1 Shared shell

The portal must provide:

- top navigation/header
- game list / home page
- game route pages
- shared settings (sound, theme later)
- shared move counter / status widgets where applicable
- shared button and dialog styles

## 3.2 Routing

Implement routes like:

```text
/
  -> portal home with game cards

/g/minzzle-fives
/g/minzzle-fives/levels
/g/minzzle-fives/play/:levelId

/g/minzzle-swipes
/g/minzzle-swipes/levels
/g/minzzle-swipes/play/:levelId

/g/minzzle-swipes-hex
/g/minzzle-swipes-hex/levels
/g/minzzle-swipes-hex/play/:levelId
```

## 3.3 API contract

Backend must expose:

```text
GET /api/games
GET /api/games/{gameId}/levels
GET /api/games/{gameId}/levels/{levelId}
GET /api/progress/{gameId}
POST /api/progress/{gameId}/{levelId}
```

Start with progress stubs if needed.

---

# 4. Game 1 — Minzzle Fives

## 4.1 Core concept

Board is a graph drawn on a rectangular grid.

Primary objects:
- nodes
- edges between adjacent nodes

Goal:
- cover all admissible edges using moves of exactly **5 edges**.

## 4.2 Base board example

Main rectangle example:

- **6 x 8 cells**
- therefore **7 x 9 nodes**
- vertical orientation

Edge counts:
- horizontal edges = 6 * 9 = 54
- vertical edges = 7 * 8 = 56
- total = 110

Since each move uses exactly 5 edges:
- total moves to cover all edges = 22

## 4.3 Rules

### 4.3.1 Move rule
A move is a continuous trail of exactly **5 unused adjacent edges**.

### 4.3.2 Reuse restrictions
- Edge cannot be reused
- Node may be revisited
- Therefore move is a **trail**, not necessarily a simple path

Example:
- Allowed: node repetition if edges are unique
- Forbidden: traversing the same edge twice

### 4.3.3 Start rule
A new move may start from **any node with at least one free incident edge**

### 4.3.4 In-move undo
If player goes back along the immediately previous edge:
- that means **undo last step**
- remove last edge from current preview

### 4.3.5 Commit rule
When current move reaches 5 edges:
- auto-commit immediately

### 4.3.6 Win condition
Board is solved when all admissible edges are used.

## 4.4 Visual rules

- unused admissible edge: thin gray
- completed move edges: solid blue
- current unfinished move: yellow
- current endpoint node of unfinished move: highlighted yellow node
- no diagonal admissible edges unless explicitly designed in a future level type

## 4.5 Input model

- tap/click node to start
- drag through adjacent nodes to extend
- drag backward along last edge to undo last step
- invalid traversal should be rejected visually

## 4.6 Required controls

- Cancel Move
- Undo Last Move
- Restart Level

## 4.7 Engine state model

```ts
type NodeId = number;
type EdgeId = number;

type GameState = {
  usedEdges: Set<EdgeId>;
  trailNodes: NodeId[];
  trailEdges: EdgeId[];
  history: EdgeId[][];
  moveLen: 5;
  totalEdges: number;
};
```

## 4.8 Validation logic

Implement deterministic logic:

1. Forward step allowed only if:
   - edge exists
   - edge is admissible
   - edge not used globally
   - edge not already in current trail

2. Backtrack allowed only if:
   - target node is previous node in current trail

3. Commit if `trailEdges.length == 5`

4. Solve if `usedEdges.size == totalEdges`

## 4.9 Level data format

```json
{
  "schemaVersion": 1,
  "gameId": "minzzle-fives",
  "levelId": "rect_6x8_001",
  "title": "Rectangle 6x8 #1",
  "board": {
    "moveLen": 5,
    "nodes": [
      { "id": 0, "x": 0, "y": 0 }
    ],
    "edges": [
      { "id": 0, "a": 0, "b": 1 }
    ]
  }
}
```

---

# 5. Game 2 — Minzzle Swipes

## 5.1 Core concept

Board is a square grid of colored cells.

A swipe does **not** create a path.

Instead:

> A swipe reverses the entire line of cells in the swipe direction.

This is a line-reversal permutation puzzle.

## 5.2 Base board examples

- 6x6
- 8x8
- 10x10

Square board uses 2 principal line families:
- rows
- columns

## 5.3 Cell content

Use **colors**, not numbers, as primary representation.

Initial solved idea example:
- 4 quadrant blocks in square mode
- each region has one color

Example 6x6 solved board:

```text
BBBYYY
BBBYYY
BBBYYY
RRRGGG
RRRGGG
RRRGGG
```

## 5.4 Swipe operation

### Horizontal swipe
Any left/right swipe on a row reverses the entire row.

Example:

```text
1 2 3 4 5 6 -> 6 5 4 3 2 1
```

### Vertical swipe
Any up/down swipe on a column reverses the entire column.

## 5.5 Important note
Swipe direction does not change mathematical effect:
- left and right both reverse the row
- up and down both reverse the column

Gesture is only used to detect intended line family.

## 5.6 Goal

Player starts from a scrambled board and must restore the solved color pattern.

## 5.7 Solved-state model

Use **region-based solved layout**:
- each predefined region must contain only its target color

Do **not** require per-cell identity tracking.

This makes the puzzle visual and accessible.

## 5.8 Scramble rule

Never generate arbitrary random states.

Always:
1. start from solved board
2. apply N legal random swipes
3. store scramble sequence if needed

This guarantees solvability.

## 5.9 State model

```ts
type ColorId = string;

type SwipesBoard = {
  rows: number;
  cols: number;
  cells: ColorId[][];
};

type SwipesMove =
  | { type: "row"; index: number }
  | { type: "col"; index: number };

type SwipesState = {
  board: SwipesBoard;
  solvedRegions: number[][];
  moveCount: number;
  moveLimit?: number;
  history: SwipesMove[];
};
```

## 5.10 Board transform logic

### Reverse row
```ts
board[row] = [...board[row]].reverse();
```

### Reverse column
Collect column, reverse, write back.

## 5.11 Win rule

Solved when all cells inside each region match region target color.

## 5.12 Input model

- swipe left/right on row -> reverse row
- swipe up/down on column -> reverse column
- line under gesture should preview-highlight before commit

## 5.13 Required controls

- Undo
- Restart
- Move Counter
- Optional move limit badge

## 5.14 Level data format

```json
{
  "schemaVersion": 1,
  "gameId": "minzzle-swipes",
  "levelId": "square_6x6_quadrants_001",
  "title": "Quadrants 6x6 #1",
  "board": {
    "rows": 6,
    "cols": 6,
    "initial": [
      ["blue","blue","blue","yellow","yellow","yellow"],
      ["blue","blue","blue","yellow","yellow","yellow"],
      ["blue","blue","blue","yellow","yellow","yellow"],
      ["red","red","red","green","green","green"],
      ["red","red","red","green","green","green"],
      ["red","red","red","green","green","green"]
    ],
    "scrambleMoves": [
      { "type": "row", "index": 1 },
      { "type": "col", "index": 4 }
    ]
  }
}
```

---

# 6. Game 3 — Minzzle Swipes Hex

## 6.1 Core concept

Same principle as Minzzle Swipes:

> Swipe reverses an entire line of cells

But board is a **regular hexagon** made of triangular piles/cells.

## 6.2 Geometry

Board:
- regular hexagon
- subdivided into equilateral triangles
- side length parameter = `n`

Use this verbal rule:

> Right hexagon covered with equilateral triangles with side equal to side of hexagon divided by n

Practical implementation may use a coordinate system more convenient for code, but the visible result must be a regular triangular-cell hexagon.

## 6.3 Allowed line families

Hex version has **3 principal directions**:
- horizontal
- left-diagonal
- right-diagonal

Any swipe snaps to one of these three axes and reverses the full line on that axis.

## 6.4 Solved-state color concept

Use **6 colors**.

Solved board is split into **6 large triangular sectors**.

Each sector:
- occupies approximately one sixth of the board
- forms one big same-color triangle
- all 6 sectors meet around the center

This is the primary solved identity of Minzzle Swipes Hex.

## 6.5 Win condition

Use **region-based validation**:
- each cell belongs to one of 6 sectors
- board is solved when each sector contains only its assigned color

No per-cell identity tracking required.

## 6.6 Move model

```ts
type HexMove = {
  axis: "horizontal" | "diagL" | "diagR";
  lineIndex: number;
};
```

## 6.7 Coordinate requirement

AI agent may choose a practical internal coordinate system, but it must support:
- enumerating all cells
- enumerating every line in the 3 principal directions
- mapping pointer location to cell
- mapping gesture to one of 3 axes

Recommended approach:
- define cells in logical coordinates
- precompute lines for all 3 axes
- store line membership tables

## 6.8 Board generation

Inputs:
- side length `n`
- 6 sector colors

Outputs:
- list of cells
- sector assignment for each cell
- line lists for all 3 directions

## 6.9 Scramble logic

Same as square:
1. begin from solved sectors
2. apply N random valid line reversals
3. resulting board becomes puzzle state

## 6.10 Input model

- user starts swipe on a cell
- detect closest of 3 allowed directions
- preview line
- on release, reverse that line

## 6.11 Animation requirement

Animate line reversal smoothly.

Do not instantly repaint.

Cells should visually move/swap along the line.

## 6.12 Level data format

```json
{
  "schemaVersion": 1,
  "gameId": "minzzle-swipes-hex",
  "levelId": "hex_n4_001",
  "title": "Hex S4 #1",
  "board": {
    "side": 4,
    "colors": ["blue","yellow","green","red","purple","orange"],
    "cells": [],
    "sectorAssignments": [],
    "scrambleMoves": [
      { "axis": "horizontal", "lineIndex": 2 },
      { "axis": "diagL", "lineIndex": 4 }
    ]
  }
}
```

---

# 7. Shared Frontend Architecture

## 7.1 Folder layout

```text
web/src/
  app/
    App.tsx
    routes.tsx
    apiClient.ts
    layout/
      Shell.tsx
      TopBar.tsx
  shared/
    ui/
      Button.tsx
      Card.tsx
      CounterBadge.tsx
    audio/
      audioManager.ts
    canvas/
      viewTransform.ts
    utils/
      math.ts
      arrays.ts
  games/
    registry.ts
    minzzle-fives/
      engine/
      render/
      input/
      ui/
    minzzle-swipes/
      engine/
      render/
      input/
      ui/
    minzzle-swipes-hex/
      engine/
      render/
      input/
      ui/
```

## 7.2 Agent instruction

Keep each game engine independent from React.

UI must call pure engine functions.

Do not bury logic in components.

---

# 8. Shared Backend Architecture

## 8.1 Folder layout

```text
server/src/Minzzle.Server/
  Api/
    Games/
    Levels/
    Progress/
  Contracts/
    Games/
    Levels/
    Progress/
  Domain/
    Games/
    Levels/
    Progress/
  Services/
  Storage/
    InMemory/
  Seed/
```

## 8.2 Backend duties

- provide game list
- provide level summaries
- provide level payloads
- later store best results / progress

---

# 9. Pipelines for AI Agents

## 9.1 Pipeline A — Repository bootstrap

Agent tasks:
1. create monorepo structure
2. initialize ASP.NET server
3. initialize Vite React TypeScript app
4. configure CORS for local dev
5. create shared route structure
6. create game registry

Deliverable:
- portal starts
- home page shows game cards
- API returns game list

## 9.2 Pipeline B — Minzzle Fives MVP

Agent tasks:
1. implement graph board data model
2. implement 5-edge trail engine
3. implement canvas board renderer
4. implement node hit-testing
5. implement move preview / commit
6. implement undo/cancel/restart
7. load seeded level from API

Acceptance:
- 6x8-cells board level playable
- exactly 5-edge moves only
- no illegal edge reuse
- yellow current endpoint visible

## 9.3 Pipeline C — Minzzle Swipes MVP

Agent tasks:
1. implement color-grid board
2. implement row reversal
3. implement column reversal
4. implement swipe direction detection
5. implement line preview highlight
6. implement solved-region validator
7. seed one 6x6 quadrant-color level

Acceptance:
- user can reverse rows/cols by swiping
- scramble is solvable
- board can be restored

## 9.4 Pipeline D — Minzzle Swipes Hex MVP

Agent tasks:
1. implement triangular-cell hex board model
2. generate cells and 6 sectors
3. precompute lines on 3 axes
4. implement line reversal
5. implement axis-snapped swipe detection
6. implement region validator for 6 sectors
7. seed one small hex level

Acceptance:
- board visually forms a proper regular hex
- swipes reverse only valid full lines
- solved state equals 6 same-color triangles

## 9.5 Pipeline E — Shared polish

Agent tasks:
1. move counters
2. undo/restart
3. sound toggle
4. shared button style
5. responsive layout
6. game cards on home page

---

# 10. Non-Negotiable Guardrails for Agents

1. **Do not invent rule changes**
   - Fives is about edges, not cells
   - Swipes is about whole-line reversal, not path tracing
   - Swipes Hex is same reversal principle on 3 axes

2. **Do not approximate geometry carelessly**
   - Fives example board is 6x8 cells -> 7x9 nodes
   - Swipes Hex must visually read as proper regular hex

3. **Do not generate unsolvable scramble states**
   - always scramble from solved state using legal moves

4. **Do not couple engine logic to UI**
   - engines must be testable independently

5. **Do not rely on random visual guesses**
   - game state must be mathematically valid first, rendered second

---

# 11. Suggested Milestone Order

## Milestone 1
Portal shell + backend + game registry

## Milestone 2
Minzzle Fives fully playable

## Milestone 3
Minzzle Swipes square playable

## Milestone 4
Minzzle Swipes Hex playable

## Milestone 5
Progress persistence + polish

---

# 12. Acceptance Checklist

## Portal
- [ ] Home page lists all 3 games
- [ ] Shared shell works
- [ ] API returns game list and levels

## Minzzle Fives
- [ ] 5-edge move logic correct
- [ ] illegal edge reuse blocked
- [ ] auto-commit at 5 edges
- [ ] all edges coverage win works

## Minzzle Swipes
- [ ] row reversal works
- [ ] column reversal works
- [ ] solved-region validation works
- [ ] scramble generation guaranteed solvable

## Minzzle Swipes Hex
- [ ] proper hex board exists
- [ ] 3-axis line reversal works
- [ ] 6-sector solved pattern works
- [ ] line previews and animation work

---

# 13. Final Agent Instruction

Build the system incrementally.

Priority:
1. correctness of engine logic
2. clean level formats
3. shared portal shell
4. canvas rendering
5. animation and polish

Never change game rules unless the user explicitly edits the spec.
