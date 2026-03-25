import { HexGameState, HexBoardData } from '../engine/types';

const BG = '#0d1117';
const SQRT3 = Math.sqrt(3);

// Visual style — mirrors square swipes: cells shrink from their centroid
// leaving a visible gap between neighbours, with rounded corners.
const CELL_SCALE = 0.90;   // 10% inward → ~3-4 px gap at typical board size
const CORNER_RADIUS = 4;   // px, same ballpark as square swipes border-radius

function shrinkCell(
  verts: [number, number][],
  cx: number, cy: number,
  scale: number
): [number, number][] {
  return verts.map(([vx, vy]) => [
    cx + (vx - cx) * scale,
    cy + (vy - cy) * scale,
  ]);
}

function drawRoundedTriangle(
  ctx: CanvasRenderingContext2D,
  verts: [number, number][],
  radius: number
) {
  const n = 3;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const prev = verts[(i + n - 1) % n];
    const curr = verts[i];
    const next = verts[(i + 1) % n];

    const dPx = prev[0] - curr[0], dPy = prev[1] - curr[1];
    const dNx = next[0] - curr[0], dNy = next[1] - curr[1];
    const lenP = Math.sqrt(dPx * dPx + dPy * dPy);
    const lenN = Math.sqrt(dNx * dNx + dNy * dNy);
    const r = Math.min(radius, lenP / 2, lenN / 2);

    // Entry point: move from curr toward prev by r
    const ex = curr[0] + (dPx / lenP) * r;
    const ey = curr[1] + (dPy / lenP) * r;

    if (i === 0) ctx.moveTo(ex, ey);
    else ctx.lineTo(ex, ey);

    // Arc at the corner: arcTo draws through curr toward next
    ctx.arcTo(curr[0], curr[1], curr[0] + (dNx / lenN) * r, curr[1] + (dNy / lenN) * r, r);
  }
  ctx.closePath();
}

export interface HexViewTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function computeHexFit(side: number, canvasW: number, canvasH: number): HexViewTransform {
  const padding = 60;
  const hexW = 2 * side;
  const hexH = side * SQRT3;
  const scaleX = (canvasW - padding * 2) / hexW;
  const scaleY = (canvasH - padding * 2) / hexH;
  const scale = Math.min(scaleX, scaleY);
  return { offsetX: canvasW / 2, offsetY: canvasH / 2, scale };
}

function toScreen(x: number, y: number, vt: HexViewTransform): [number, number] {
  return [x * vt.scale + vt.offsetX, -y * vt.scale + vt.offsetY];
}

export function renderHex(
  ctx: CanvasRenderingContext2D,
  state: HexGameState,
  vt: HexViewTransform,
  canvasW: number,
  canvasH: number,
  animProgress?: { lineAxis: string; lineIndex: number; t: number }
) {
  const { boardData, cellColors, highlightLine, won } = state;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  for (const cell of boardData.cells) {
    const verts = cell.vertices.map(([x, y]) => toScreen(x, y, vt));
    const [cx, cy] = toScreen(cell.centroid[0], cell.centroid[1], vt);
    const shrunk = shrinkCell(verts, cx, cy, CELL_SCALE);

    // Cell fill
    drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
    ctx.fillStyle = cellColors[cell.id];
    ctx.fill();

    // Highlight overlay
    if (highlightLine) {
      const lineIdx = boardData.cellToLine[highlightLine.axis]?.get(cell.id);
      if (lineIdx === highlightLine.lineIndex) {
        drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
    }

    // Win shimmer
    if (won) {
      drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
    }
  }

  // Hex outline
  const hexVerts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    hexVerts.push(toScreen(
      boardData.side * Math.cos(angle),
      boardData.side * Math.sin(angle),
      vt
    ));
  }
  ctx.beginPath();
  ctx.moveTo(hexVerts[0][0], hexVerts[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(hexVerts[i][0], hexVerts[i][1]);
  ctx.closePath();
  ctx.strokeStyle = won ? 'rgba(118, 255, 3, 0.5)' : 'rgba(0, 229, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function sign(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
}

function pointInTriangle(px: number, py: number, v: [number, number][]): boolean {
  const d1 = sign(px, py, v[0][0], v[0][1], v[1][0], v[1][1]);
  const d2 = sign(px, py, v[1][0], v[1][1], v[2][0], v[2][1]);
  const d3 = sign(px, py, v[2][0], v[2][1], v[0][0], v[0][1]);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

export function hitTestHexCell(
  boardData: HexBoardData,
  vt: HexViewTransform,
  screenX: number,
  screenY: number
): number | null {
  for (const cell of boardData.cells) {
    const verts = cell.vertices.map(([x, y]) => toScreen(x, y, vt));
    if (pointInTriangle(screenX, screenY, verts)) return cell.id;
  }
  return null;
}

export function snapToAxis(dx: number, dy: number): 'horizontal' | 'diagR' | 'diagL' {
  const projH = Math.abs(dx);
  const projR = Math.abs(dx * 0.5 + dy * SQRT3 / 2);
  const projL = Math.abs(-dx * 0.5 + dy * SQRT3 / 2);
  if (projH >= projR && projH >= projL) return 'horizontal';
  if (projR >= projL) return 'diagR';
  return 'diagL';
}
