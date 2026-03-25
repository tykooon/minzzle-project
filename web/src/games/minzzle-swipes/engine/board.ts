import { ColorId, SwipesBoard, SwipesMove } from './types';

export function cloneBoard(board: SwipesBoard): SwipesBoard {
  return {
    rows: board.rows,
    cols: board.cols,
    cells: board.cells.map(row => [...row]),
  };
}

export function reverseRow(board: SwipesBoard, rowIndex: number): SwipesBoard {
  const next = cloneBoard(board);
  next.cells[rowIndex].reverse();
  return next;
}

export function reverseCol(board: SwipesBoard, colIndex: number): SwipesBoard {
  const next = cloneBoard(board);
  const col: ColorId[] = [];
  for (let r = 0; r < next.rows; r++) col.push(next.cells[r][colIndex]);
  col.reverse();
  for (let r = 0; r < next.rows; r++) next.cells[r][colIndex] = col[r];
  return next;
}

export function applyMove(board: SwipesBoard, move: SwipesMove): SwipesBoard {
  return move.type === 'row' ? reverseRow(board, move.index) : reverseCol(board, move.index);
}

export function scramble(solved: ColorId[][], moves: SwipesMove[]): SwipesBoard {
  let board: SwipesBoard = {
    rows: solved.length,
    cols: solved[0].length,
    cells: solved.map(row => [...row]),
  };
  for (const move of moves) {
    board = applyMove(board, move);
  }
  return board;
}

export function checkWin(board: SwipesBoard, solved: ColorId[][]): boolean {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (board.cells[r][c] !== solved[r][c]) return false;
    }
  }
  return true;
}
