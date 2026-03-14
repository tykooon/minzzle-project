// Fillby5 core types

export interface NodeData {
  id: number;
  x: number;
  y: number;
}

export interface EdgeData {
  id: number;
  a: number; // node id
  b: number; // node id
}

export interface LevelData {
  schemaVersion: number;
  moveLen: number;
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface LevelMeta {
  id: string;
  name: string;
  difficulty: number; // 1-5
  edgeCount: number;
}

export interface GameState {
  level: LevelData;
  usedEdges: Set<number>;     // committed edge IDs
  trailNodes: number[];       // current move node path
  trailEdges: number[];       // current move edge IDs
  history: number[][];        // past committed moves (arrays of edge IDs)
  moveLen: number;
  totalEdges: number;
  won: boolean;
}

/**
 * A completed solution to a level.
 * Stored client-side now; will be persisted server-side once auth is added.
 * `moves` mirrors GameState.history — each inner array is the edge IDs of one completed move.
 */
export interface Solution {
  id: string;          // uuid, generated at win time
  levelId: string;
  userId?: string;     // undefined until auth is implemented
  solvedAt: string;    // ISO 8601
  moves: number[][];   // edge ID arrays, one per move, in completion order
}

export type GameAction =
  | { type: 'STEP'; nodeId: number }
  | { type: 'CANCEL_MOVE' }
  | { type: 'UNDO_MOVE' }
  | { type: 'RESET' };
