import { HexGameState, HexAction, HexLevelData, HexMove } from './types';
import { generateHexBoard } from './hexGrid';

function reverseLine(cellColors: string[], cellIds: number[]): string[] {
  const next = [...cellColors];
  const colors = cellIds.map(id => cellColors[id]);
  colors.reverse();
  cellIds.forEach((id, i) => next[id] = colors[i]);
  return next;
}

function findLine(state: HexGameState, move: HexMove) {
  return state.boardData.lines.find(l => l.axis === move.axis && l.index === move.lineIndex);
}

export function createHexInitialState(level: HexLevelData): HexGameState {
  const boardData = generateHexBoard(level.side);
  const solvedColors = boardData.cells.map(c => level.colors[c.sector]);
  let cellColors = [...solvedColors];

  for (const move of level.scrambleMoves) {
    const line = boardData.lines.find(l => l.axis === move.axis && l.index === move.lineIndex);
    if (line) cellColors = reverseLine(cellColors, line.cellIds);
  }

  return {
    boardData,
    cellColors,
    solvedColors,
    colors: level.colors,
    moveCount: 0,
    history: [],
    won: false,
    highlightLine: null,
  };
}

function checkWin(cellColors: string[], solvedColors: string[]): boolean {
  return cellColors.every((c, i) => c === solvedColors[i]);
}

export function hexReducer(state: HexGameState, action: HexAction): HexGameState {
  switch (action.type) {
    case 'SWIPE': {
      if (state.won) return state;
      const line = findLine(state, action.move);
      if (!line) return state;
      const cellColors = reverseLine(state.cellColors, line.cellIds);
      const won = checkWin(cellColors, state.solvedColors);
      return {
        ...state,
        cellColors,
        moveCount: state.moveCount + 1,
        history: [...state.history, action.move],
        won,
        highlightLine: null,
      };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const lastMove = state.history[state.history.length - 1];
      const line = findLine(state, lastMove);
      if (!line) return state;
      const cellColors = reverseLine(state.cellColors, line.cellIds);
      return {
        ...state,
        cellColors,
        moveCount: state.moveCount + 1,
        history: state.history.slice(0, -1),
        won: false,
        highlightLine: null,
      };
    }
    case 'RESET': {
      let cellColors = [...state.cellColors];
      for (let i = state.history.length - 1; i >= 0; i--) {
        const move = state.history[i];
        const line = findLine(state, move);
        if (line) cellColors = reverseLine(cellColors, line.cellIds);
      }
      return { ...state, cellColors, moveCount: 0, history: [], won: false, highlightLine: null };
    }
    case 'HIGHLIGHT':
      return { ...state, highlightLine: action.line };
    default:
      return state;
  }
}
