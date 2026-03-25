import { SwipesGameState, SwipesAction, SwipesLevelData } from './types';
import { scramble, applyMove, checkWin } from './board';

export function createSwipesInitialState(level: SwipesLevelData): SwipesGameState {
  const board = scramble(level.board.solved, level.board.scrambleMoves);
  return {
    board,
    solved: level.board.solved,
    moveCount: 0,
    history: [],
    won: false,
    highlightLine: null,
  };
}

export function swipesReducer(state: SwipesGameState, action: SwipesAction): SwipesGameState {
  switch (action.type) {
    case 'SWIPE': {
      if (state.won) return state;
      const newBoard = applyMove(state.board, action.move);
      const won = checkWin(newBoard, state.solved);
      return {
        ...state,
        board: newBoard,
        moveCount: state.moveCount + 1,
        history: [...state.history, action.move],
        won,
        highlightLine: null,
      };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const lastMove = state.history[state.history.length - 1];
      // Reversing a reversal = applying same move again
      const newBoard = applyMove(state.board, lastMove);
      return {
        ...state,
        board: newBoard,
        moveCount: state.moveCount + 1,
        history: state.history.slice(0, -1),
        won: false,
        highlightLine: null,
      };
    }
    case 'RESET': {
      // Re-scramble from solved using original scramble
      // We need the level data, but we stored solved. Re-scramble by replaying history in reverse
      // Actually, simplest: undo all moves
      let board = state.board;
      for (let i = state.history.length - 1; i >= 0; i--) {
        board = applyMove(board, state.history[i]);
      }
      // Now re-scramble: board should be back at original scrambled state
      // Wait, that undoes to solved. We need to get back to scrambled.
      // Actually undoing all moves from current state takes us to the initial scrambled state.
      // No — each undo applies the same move (reversal is self-inverse), so undoing all history
      // from current state gives us the original scrambled state.
      return {
        ...state,
        board,
        moveCount: 0,
        history: [],
        won: false,
        highlightLine: null,
      };
    }
    case 'HIGHLIGHT':
      return { ...state, highlightLine: action.line };
    default:
      return state;
  }
}
