import { SwipesGameState } from '../engine/types';

export interface SwipesAnimState {
  lineType: 'row' | 'col';
  lineIndex: number;
  angle: number;      // 0 → Math.PI
  direction: number;  // +1 or -1 (which side comes forward)
}

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

const DEPTH = 0.25;

function buildAnimatedRowTiles(
  board: SwipesGameState['board'],
  vt: SwipesViewTransform,
  anim: SwipesAnimState
) {
  const { cols } = board;
  const cs = vt.cellSize;
  const gap = CELL_GAP;
  const rowCenterX = vt.offsetX + (cols * cs) / 2;
  const rowHalfWidth = (cols * cs) / 2;
  const row = anim.lineIndex;
  const y = vt.offsetY + row * cs + gap / 2;
  const h = cs - gap;

  return board.cells[row].map((color, col) => {
    const tileCenterX = vt.offsetX + col * cs + cs / 2;
    const dx = tileCenterX - rowCenterX;
    const projCenterX = rowCenterX + dx * Math.cos(anim.angle);
    const z = anim.direction * dx * Math.sin(anim.angle);
    const scale = 1 + DEPTH * (z / rowHalfWidth);
    const w = Math.max(1, (cs - gap) * scale);
    const x = projCenterX - w / 2;
    const r = Math.max(1, BORDER_RADIUS * scale);
    return { color, x, y, w, h, r, z };
  });
}

function buildAnimatedColTiles(
  board: SwipesGameState['board'],
  vt: SwipesViewTransform,
  anim: SwipesAnimState
) {
  const { rows } = board;
  const cs = vt.cellSize;
  const gap = CELL_GAP;
  const colCenterY = vt.offsetY + (rows * cs) / 2;
  const colHalfHeight = (rows * cs) / 2;
  const col = anim.lineIndex;
  const x = vt.offsetX + col * cs + gap / 2;
  const w = cs - gap;

  return board.cells.map((boardRow, row) => {
    const tileCenterY = vt.offsetY + row * cs + cs / 2;
    const dy = tileCenterY - colCenterY;
    const projCenterY = colCenterY + dy * Math.cos(anim.angle);
    const z = anim.direction * dy * Math.sin(anim.angle);
    const scale = 1 + DEPTH * (z / colHalfHeight);
    const h = Math.max(1, (cs - gap) * scale);
    const y = projCenterY - h / 2;
    const r = Math.max(1, BORDER_RADIUS * scale);
    return { color: boardRow[col], x, y, w, h, r, z };
  });
}

export function renderSwipes(
  ctx: CanvasRenderingContext2D,
  state: SwipesGameState,
  vt: SwipesViewTransform,
  canvasW: number,
  canvasH: number,
  anim?: SwipesAnimState
) {
  const { board, solved, highlightLine, won } = state;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const gap = CELL_GAP;
  const r = BORDER_RADIUS;

  drawHomeIndicators(ctx, vt, solved, board.rows, board.cols);

  // Draw all static tiles (skip the animated line when anim is active)
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (anim) {
        if (anim.lineType === 'row' && anim.lineIndex === row) continue;
        if (anim.lineType === 'col' && anim.lineIndex === col) continue;
      }
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

  // Draw animated line tiles sorted back-to-front
  if (anim) {
    const tiles =
      anim.lineType === 'row'
        ? buildAnimatedRowTiles(board, vt, anim)
        : buildAnimatedColTiles(board, vt, anim);

    tiles.sort((a, b) => a.z - b.z); // back-to-front
    for (const t of tiles) {
      drawTile3D(ctx, t.x, t.y, t.w, t.h, t.r, t.color);
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
