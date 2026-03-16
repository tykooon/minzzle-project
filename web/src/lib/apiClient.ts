// All /api/* requests are proxied to the backend in dev (see vite.config.ts).
// In production set VITE_API_BASE or ensure the web server forwards /api.
const BASE = import.meta.env.VITE_API_BASE ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – POST ${path}`);
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – PUT ${path}`);
  return res.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status} – DELETE ${path}`);
}

// ── Response shapes (mirrors server Contracts) ──────────────────────

export interface LevelSummary {
  id: string;
  name: string;
  difficulty: number;
  edgeCount: number;
  estimatedMoves: number;
  hasSolution: boolean;
}

export interface LevelFull {
  id: string;
  name: string;
  difficulty: number;
  schemaVersion: number;
  moveLen: number;
  nodes: { id: number; x: number; y: number }[];
  edges: { id: number; a: number; b: number }[];
  solutionJson: string | null;
}

export interface SaveSolutionRequest {
  solutionJson: string;
}

export interface SaveLevelRequest {
  name: string;
  difficulty: number;
  schemaVersion: number;
  moveLen: number;
  nodes: { id: number; x: number; y: number }[];
  edges: { id: number; a: number; b: number }[];
}

// ── API calls ────────────────────────────────────────────────────────

export const api = {
  getLevels: (gameId: string): Promise<LevelSummary[]> =>
    get(`/api/games/${gameId}/levels`),

  getLevel: (gameId: string, levelId: string): Promise<LevelFull> =>
    get(`/api/games/${gameId}/levels/${levelId}`),

  createLevel: (gameId: string, data: SaveLevelRequest): Promise<LevelFull> =>
    post(`/api/games/${gameId}/levels`, data),

  updateLevel: (gameId: string, levelId: string, data: SaveLevelRequest): Promise<LevelFull> =>
    put(`/api/games/${gameId}/levels/${levelId}`, data),

  deleteLevel: (gameId: string, levelId: string): Promise<void> =>
    del(`/api/games/${gameId}/levels/${levelId}`),

  saveLevelSolution: (gameId: string, levelId: string, data: SaveSolutionRequest): Promise<LevelFull> =>
    put(`/api/games/${gameId}/levels/${levelId}/solution`, data),
};
