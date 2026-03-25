export interface HexCell {
  id: number;
  a: number;
  b: number;
  isUp: boolean;
  vertices: [number, number][];
  centroid: [number, number];
  sector: number;
}

export interface HexLineData {
  axis: 'horizontal' | 'diagL' | 'diagR';
  index: number;
  cellIds: number[];
}

export interface HexBoardData {
  side: number;
  cells: HexCell[];
  lines: HexLineData[];
  cellToLine: Record<string, Map<number, number>>;
}

export type HexMove = {
  axis: 'horizontal' | 'diagL' | 'diagR';
  lineIndex: number;
};

export interface HexLevelData {
  schemaVersion: number;
  title: string;
  side: number;
  colors: string[];
  scrambleMoves: HexMove[];
}

export interface HexLevelMeta {
  id: string;
  name: string;
  difficulty: number;
  side: number;
}

export interface HexGameState {
  boardData: HexBoardData;
  cellColors: string[];
  solvedColors: string[];
  colors: string[];
  moveCount: number;
  history: HexMove[];
  won: boolean;
  highlightLine: { axis: 'horizontal' | 'diagL' | 'diagR'; lineIndex: number } | null;
}

export type HexAction =
  | { type: 'SWIPE'; move: HexMove }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'HIGHLIGHT'; line: { axis: 'horizontal' | 'diagL' | 'diagR'; lineIndex: number } | null };
