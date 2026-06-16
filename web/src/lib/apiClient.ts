// All /api/* requests are proxied to the backend in dev (see vite.config.ts).
// In production set VITE_API_BASE or ensure the web server forwards /api.
const BASE = import.meta.env.VITE_API_BASE ?? '';

// credentials:'include' sends the auth session cookie with every request.
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – POST ${path}`);
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – PUT ${path}`);
  return res.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', credentials: 'include' });
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

export interface GameSummary {
  id: string;
  name: string;
  description: string;
  levelCount: number;
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
  boardJson: string | null;
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

export type AuthProvider = 'google' | 'microsoft' | 'facebook';

export interface AuthUser {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface Progress {
  gameId: string;
  levelId: string;
  completed: boolean;
  bestMoves: number;
}

// ── API calls ────────────────────────────────────────────────────────

export const api = {
  getGames: (): Promise<GameSummary[]> =>
    get('/api/games'),

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

  // ── Progress (requires an authenticated session) ──────────────────
  getProgress: (gameId: string): Promise<Progress[]> =>
    get(`/api/progress/${gameId}`),

  saveProgress: (gameId: string, levelId: string, moves: number): Promise<Progress> =>
    post(`/api/progress/${gameId}/${levelId}`, { moves }),
};

// ── Auth ──────────────────────────────────────────────────────────────

interface MeResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

export const authApi = {
  // The current user, or null when anonymous.
  me: async (): Promise<AuthUser | null> => {
    const res = await fetch(`${BASE}/api/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as MeResponse;
    return data.user;
  },

  logout: async (): Promise<void> => {
    await fetch(`${BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  },

  // OAuth requires a full-page navigation, so this returns the URL to send the browser to.
  loginUrl: (provider: AuthProvider, returnUrl: string): string =>
    `${BASE}/api/auth/login/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`,
};
