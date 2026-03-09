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

export type GameAction =
  | { type: 'STEP'; nodeId: number }
  | { type: 'CANCEL_MOVE' }
  | { type: 'UNDO_MOVE' }
  | { type: 'RESET' };
