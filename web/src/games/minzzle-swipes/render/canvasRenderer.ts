import { SwipesGameState } from '../engine/types';

const BG = '#0d1117';
const CELL_GAP = 4;
const BORDER_RADIUS = 7;
const HIGHLIGHT_ALPHA = 0.30;

// Thickness of the home-color indicators drawn outside the board border
const HOME_INDICATOR_THICKNESS = 5;
const HOME_INDICATOR_GAP = 5;   // gap between board edge and indicator
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

/**
 * Draw a tile with a Rubik's-cube "plastic pillow" look:
 * 1. Solid base color
 * 2. Radial vignette (edges darker → surface looks curved/raised)
 * 3. Directional light: top-left bright, bottom-right shadowed
 * 4. Specular glare spot at top-left
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

  // 1. Base color
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // 2. Pillow vignette — radial gradient darkening the edges all around
  //    Creates the illusion of a slightly convex tile surface
  const cx = x + w / 2;
  const cy = y + h / 2;
  const diagonal = Math.sqrt(w * w + h * h) / 2;
  const vignette = ctx.createRadialGradient(cx, cy, diagonal * 0.25, cx, cy, diagonal * 0.95);
  vignette.addColorStop(0,   'rgba(0,0,0,0)');
  vignette.addColorStop(0.7, 'rgba(0,0,0,0)');
  vignette.addColorStop(1,   'rgba(0,0,0,0.42)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, w, h);

  // 3. Directional light: top-left bright → bottom-right shadow
  const dirLight = ctx.createLinearGradient(x, y, x + w, y + h);
  dirLight.addColorStop(0,   'rgba(255,255,255,0.22)');
  dirLight.addColorStop(0.45,'rgba(255,255,255,0)');
  dirLight.addColorStop(1,   'rgba(0,0,0,0.18)');
  ctx.fillStyle = dirLight;
  ctx.fillRect(x, y, w, h);

  // 4. Specular glare — bright spot near top-left
  const gx = x + w * 0.28;
  const gy = y + h * 0.20;
  const gr = w * 0.32;
  const glare = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
  glare.addColorStop(0,    'rgba(255,255,255,0.55)');
  glare.addColorStop(0.35, 'rgba(255,255,255,0.15)');
  glare.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(x, y, w, h);

  ctx.restore();
}

/**
 * Draw home-color indicators: thin colored strips just outside each board edge,
 * showing the solved color for every outer cell.
 *
 * The indicator for column `col` at the top edge is colored with solved[0][col],
 * and so on for bottom/left/right edges.
 */
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

    // Top edge — solved[0][col]
    ctx.fillStyle = solved[0][col];
    roundRect(ctx, cellX, vt.offsetY - pad - t, cellW, t, r);
    ctx.fill();

    // Bottom edge — solved[rows-1][col]
    ctx.fillStyle = solved[rows - 1][col];
    roundRect(ctx, cellX, vt.offsetY + rows * vt.cellSize + pad, cellW, t, r);
    ctx.fill();
  }

  for (let row = 0; row < rows; row++) {
    const cellY = vt.offsetY + row * vt.cellSize + gap / 2;
    const cellH = vt.cellSize - gap;

    // Left edge — solved[row][0]
    ctx.fillStyle = solved[row][0];
    roundRect(ctx, vt.offsetX - pad - t, cellY, t, cellH, r);
    ctx.fill();

    // Right edge — solved[row][cols-1]
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

  // Home indicators — drawn behind the board border
  drawHomeIndicators(ctx, vt, solved, board.rows, board.cols);

  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const x = vt.offsetX + col * vt.cellSize + gap / 2;
      const y = vt.offsetY + row * vt.cellSize + gap / 2;
      const w = vt.cellSize - gap;
      const h = vt.cellSize - gap;

      drawTile3D(ctx, x, y, w, h, r, board.cells[row][col]);

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
  ctx.strokeStyle = won ? '#76ff03' : 'rgba(150,170,190,0.15)';
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
