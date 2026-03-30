import { SwipesGameState } from '../engine/types';

const BG = '#070b12';
const CELL_GAP = 8;
const BORDER_RADIUS = 14;
const HIGHLIGHT_ALPHA = 0.28;

const HOME_INDICATOR_THICKNESS = 5;
const HOME_INDICATOR_GAP = 5;
const HOME_INDICATOR_RADIUS = 2;
const HOME_INDICATOR_ALPHA = 0.85;

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
  const padding = Math.min(40, canvasW * 0.04);
  const availW = canvasW - padding * 2;
  const availH = canvasH - padding * 2;
  const cellSize = Math.min(availW / cols, availH / rows, 90);
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

/**
 * Convex dome tile — flat saturated base with a prominent oval specular
 * highlight (like a real Rubik's sticker) plus edge shadow at bottom/right.
 */
function drawTile3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();

  // 1. Flat base
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // 2. Bottom-right edge shadow — gives depth / raised-frame feel
  const botShadow = ctx.createLinearGradient(x, y + h, x, y + h * 0.70);
  botShadow.addColorStop(0,   'rgba(0,0,0,0.42)');
  botShadow.addColorStop(0.5, 'rgba(0,0,0,0.18)');
  botShadow.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = botShadow;
  ctx.fillRect(x, y, w, h);

  const rightShadow = ctx.createLinearGradient(x + w, y, x + w * 0.78, y);
  rightShadow.addColorStop(0, 'rgba(0,0,0,0.26)');
  rightShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rightShadow;
  ctx.fillRect(x, y, w, h);

  // 3. Convex dome highlight — large oval glare in the upper-centre
  //    Offset inner/outer focal points create the oval lens shape.
  const glare = ctx.createRadialGradient(
    x + w * 0.42, y + h * 0.28, 0,
    x + w * 0.50, y + h * 0.50, w * 0.82
  );
  glare.addColorStop(0,    'rgba(255,255,255,0.52)');
  glare.addColorStop(0.22, 'rgba(255,255,255,0.30)');
  glare.addColorStop(0.48, 'rgba(255,255,255,0.08)');
  glare.addColorStop(0.72, 'rgba(255,255,255,0.02)');
  glare.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(x, y, w, h);

  // 4. Thin top-edge highlight line
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 1, y + 1, w - 2, 1);

  ctx.restore();
}

function drawHomeIndicators(
  ctx: CanvasRenderingContext2D,
  vt: SwipesViewTransform,
  solved: string[][],
  rows: number,
  cols: number
) {
  const gap = CELL_GAP;
  const t = HOME_INDICATOR_THICKNESS;
  const pad = HOME_INDICATOR_GAP;
  const r = HOME_INDICATOR_RADIUS;

  ctx.save();
  ctx.globalAlpha = HOME_INDICATOR_ALPHA;

  for (let col = 0; col < cols; col++) {
    const cellX = vt.offsetX + col * vt.cellSize + gap / 2;
    const cellW = vt.cellSize - gap;

    ctx.fillStyle = solved[0][col];
    roundRect(ctx, cellX, vt.offsetY - pad - t, cellW, t, r);
    ctx.fill();

    ctx.fillStyle = solved[rows - 1][col];
    roundRect(ctx, cellX, vt.offsetY + rows * vt.cellSize + pad, cellW, t, r);
    ctx.fill();
  }

  for (let row = 0; row < rows; row++) {
    const cellY = vt.offsetY + row * vt.cellSize + gap / 2;
    const cellH = vt.cellSize - gap;

    ctx.fillStyle = solved[row][0];
    roundRect(ctx, vt.offsetX - pad - t, cellY, t, cellH, r);
    ctx.fill();

    ctx.fillStyle = solved[row][cols - 1];
    roundRect(ctx, vt.offsetX + cols * vt.cellSize + pad, cellY, t, cellH, r);
    ctx.fill();
  }

  ctx.restore();
}

export function renderSwipes(
  ctx: CanvasRenderingContext2D,
  state: SwipesGameState,
  vt: SwipesViewTransform,
  canvasW: number,
  canvasH: number
) {
  const { board, solved, highlightLine, won } = state;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const gap = CELL_GAP;
  const r = BORDER_RADIUS;

  drawHomeIndicators(ctx, vt, solved, board.rows, board.cols);

  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const x = vt.offsetX + col * vt.cellSize + gap / 2;
      const y = vt.offsetY + row * vt.cellSize + gap / 2;
      const w = vt.cellSize - gap;
      const h = vt.cellSize - gap;

      drawTile3D(ctx, x, y, w, h, r, board.cells[row][col]);

      if (won) {
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        roundRect(ctx, x, y, w, h, r);
        ctx.fill();
      }

      if (
        highlightLine &&
        ((highlightLine.type === 'row' && highlightLine.index === row) ||
          (highlightLine.type === 'col' && highlightLine.index === col))
      ) {
        ctx.fillStyle = `rgba(255,255,255,${HIGHLIGHT_ALPHA})`;
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
  ctx.strokeStyle = won ? '#76ff03' : 'rgba(150,170,190,0.12)';
  ctx.lineWidth = 2;
  roundRect(ctx, bx - 2, by - 2, bw + 4, bh + 4, r + 2);
  ctx.stroke();
}

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
