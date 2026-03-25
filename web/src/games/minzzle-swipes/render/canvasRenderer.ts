import { SwipesGameState } from '../engine/types';

const BG = '#0d1117';
const CELL_GAP = 3;
const BORDER_RADIUS = 6;
const HIGHLIGHT_ALPHA = 0.35;

export interface SwipesViewTransform {
  offsetX: number;
  offsetY: number;
  cellSize: number;
}

export function computeSwipesFit(
  rows: number,
  cols: number,
  canvasW: number,
  canvasH: number
): SwipesViewTransform {
  const padding = 60;
  const availW = canvasW - padding * 2;
  const availH = canvasH - padding * 2;
  const cellSize = Math.min(availW / cols, availH / rows, 80);
  const boardW = cols * cellSize;
  const boardH = rows * cellSize;
  return {
    offsetX: (canvasW - boardW) / 2,
    offsetY: (canvasH - boardH) / 2,
    cellSize,
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function renderSwipes(
  ctx: CanvasRenderingContext2D,
  state: SwipesGameState,
  vt: SwipesViewTransform,
  canvasW: number,
  canvasH: number
) {
  const { board, highlightLine, won } = state;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const gap = CELL_GAP;
  const r = BORDER_RADIUS;

  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const x = vt.offsetX + col * vt.cellSize + gap / 2;
      const y = vt.offsetY + row * vt.cellSize + gap / 2;
      const w = vt.cellSize - gap;
      const h = vt.cellSize - gap;

      // Cell color
      ctx.fillStyle = board.cells[row][col];
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();

      // Win shimmer
      if (won) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        roundRect(ctx, x, y, w, h, r);
        ctx.fill();
      }

      // Highlight line
      if (
        highlightLine &&
        ((highlightLine.type === 'row' && highlightLine.index === row) ||
          (highlightLine.type === 'col' && highlightLine.index === col))
      ) {
        ctx.fillStyle = `rgba(255, 255, 255, ${HIGHLIGHT_ALPHA})`;
        roundRect(ctx, x, y, w, h, r);
        ctx.fill();
      }
    }
  }

  // Board border
  const bx = vt.offsetX;
  const by = vt.offsetY;
  const bw = board.cols * vt.cellSize;
  const bh = board.rows * vt.cellSize;
  ctx.strokeStyle = won ? '#76ff03' : 'rgba(150,170,190,0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, bx - 2, by - 2, bw + 4, bh + 4, r + 2);
  ctx.stroke();
}

/** Determine which cell [row, col] a screen point falls in, or null */
export function hitTestCell(
  vt: SwipesViewTransform,
  rows: number,
  cols: number,
  screenX: number,
  screenY: number
): [number, number] | null {
  const col = Math.floor((screenX - vt.offsetX) / vt.cellSize);
  const row = Math.floor((screenY - vt.offsetY) / vt.cellSize);
  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
  return [row, col];
}
