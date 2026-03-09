// All /api/* requests are proxied to the backend in dev (see vite.config.ts).
// In production set VITE_API_BASE or ensure the web server forwards /api.
const BASE = import.meta.env.VITE_API_BASE ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${path}`);
  return res.json() as Promise<T>;
}

// ── Response shapes (mirrors server Contracts) ──────────────────────

export interface LevelSummary {
  id: string;
  name: string;
  difficulty: number;
  edgeCount: number;
  estimatedMoves: number;
}

export interface LevelFull {
  id: string;
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
};
