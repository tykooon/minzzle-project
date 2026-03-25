export type ColorId = string;

export interface SwipesBoard {
  rows: number;
  cols: number;
  cells: ColorId[][];
}

export interface SwipesMove {
  type: 'row' | 'col';
  index: number;
}

export interface SwipesLevelData {
  schemaVersion: number;
  title: string;
  board: {
    rows: number;
    cols: number;
    solved: ColorId[][];
    scrambleMoves: SwipesMove[];
  };
}

export interface SwipesLevelMeta {
  id: string;
  name: string;
  difficulty: number;
  size: string;
}

export interface SwipesGameState {
  board: SwipesBoard;
  solved: ColorId[][];
  moveCount: number;
  history: SwipesMove[];
  won: boolean;
  highlightLine: { type: 'row' | 'col'; index: number } | null;
}

export type SwipesAction =
  | { type: 'SWIPE'; move: SwipesMove }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'HIGHLIGHT'; line: { type: 'row' | 'col'; index: number } | null };
