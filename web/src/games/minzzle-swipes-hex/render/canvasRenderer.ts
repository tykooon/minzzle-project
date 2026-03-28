import { HexGameState, HexBoardData } from '../engine/types';

const BG = '#0d1117';
const SQRT3 = Math.sqrt(3);

const CELL_SCALE = 0.90;
const CORNER_RADIUS = 4;

// Home indicators: colored line segments drawn just outside the hex boundary
const HOME_LINE_WIDTH = 5;
const HOME_LINE_OFFSET = 7;   // pixels outward from hex edge
const HOME_LINE_TRIM = 0.10;  // fraction trimmed from each end (gap between edges)
const HOME_LINE_ALPHA = 0.85;

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

    const ex = curr[0] + (dPx / lenP) * r;
    const ey = curr[1] + (dPy / lenP) * r;

    if (i === 0) ctx.moveTo(ex, ey);
    else ctx.lineTo(ex, ey);

    ctx.arcTo(curr[0], curr[1], curr[0] + (dNx / lenN) * r, curr[1] + (dNy / lenN) * r, r);
  }
  ctx.closePath();
}

/**
 * Draw a triangular tile with the same Rubik's "plastic pillow" look:
 * vignette (edge darkening) + directional light + specular glare.
 */
function drawTriTile3D(
  ctx: CanvasRenderingContext2D,
  shrunk: [number, number][],
  color: string
) {
  const xs = shrunk.map(v => v[0]);
  const ys = shrunk.map(v => v[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const tw = maxX - minX;
  const th = maxY - minY;
  const tcx = minX + tw / 2;
  const tcy = minY + th / 2;

  ctx.save();
  drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
  ctx.clip();

  // 1. Base color
  ctx.fillStyle = color;
  ctx.fillRect(minX, minY, tw, th);

  // 2. Pillow vignette — radial, edge darkening
  const diagonal = Math.sqrt(tw * tw + th * th) / 2;
  const vignette = ctx.createRadialGradient(tcx, tcy, diagonal * 0.20, tcx, tcy, diagonal * 0.95);
  vignette.addColorStop(0,   'rgba(0,0,0,0)');
  vignette.addColorStop(0.65,'rgba(0,0,0,0)');
  vignette.addColorStop(1,   'rgba(0,0,0,0.42)');
  ctx.fillStyle = vignette;
  ctx.fillRect(minX, minY, tw, th);

  // 3. Directional light: top-left → bottom-right
  const dirLight = ctx.createLinearGradient(minX, minY, maxX, maxY);
  dirLight.addColorStop(0,    'rgba(255,255,255,0.22)');
  dirLight.addColorStop(0.45, 'rgba(255,255,255,0)');
  dirLight.addColorStop(1,    'rgba(0,0,0,0.18)');
  ctx.fillStyle = dirLight;
  ctx.fillRect(minX, minY, tw, th);

  // 4. Specular glare
  const gx = minX + tw * 0.30;
  const gy = minY + th * 0.22;
  const gr = Math.min(tw, th) * 0.38;
  const glare = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
  glare.addColorStop(0,    'rgba(255,255,255,0.55)');
  glare.addColorStop(0.35, 'rgba(255,255,255,0.15)');
  glare.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(minX, minY, tw, th);

  ctx.restore();
}

export interface HexViewTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function computeHexFit(side: number, canvasW: number, canvasH: number): HexViewTransform {
  const padding = Math.min(40, canvasW * 0.04);
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

/**
 * Draw colored line segments just outside each of the 6 hex boundary edges.
 * Edge i (from vertex i to vertex i+1) is colored with colors[i],
 * since the sector centered at edge i corresponds to sector i.
 */
function drawHexHomeIndicators(
  ctx: CanvasRenderingContext2D,
  side: number,
  colors: string[],
  vt: HexViewTransform
) {
  ctx.save();
  ctx.globalAlpha = HOME_LINE_ALPHA;
  ctx.lineWidth = HOME_LINE_WIDTH;
  ctx.lineCap = 'round';

  for (let i = 0; i < 6; i++) {
    const angleA = (i * 60) * Math.PI / 180;
    const angleB = ((i + 1) * 60) * Math.PI / 180;

    // Hex vertices in world coords
    const wA: [number, number] = [side * Math.cos(angleA), side * Math.sin(angleA)];
    const wB: [number, number] = [side * Math.cos(angleB), side * Math.sin(angleB)];

    // Outward normal direction (from center to edge midpoint)
    const midAngle = (i * 60 + 30) * Math.PI / 180;
    const normalX =  Math.cos(midAngle);
    const normalY = -Math.sin(midAngle); // flip Y for screen coords

    // Screen positions of the two edge endpoints
    const sA = toScreen(wA[0], wA[1], vt);
    const sB = toScreen(wB[0], wB[1], vt);

    // Trim ends to create small gaps between adjacent indicators
    const trim = HOME_LINE_TRIM;
    const pAx = sA[0] + (sB[0] - sA[0]) * trim;
    const pAy = sA[1] + (sB[1] - sA[1]) * trim;
    const pBx = sA[0] + (sB[0] - sA[0]) * (1 - trim);
    const pBy = sA[1] + (sB[1] - sA[1]) * (1 - trim);

    // Offset outward
    const ox = normalX * HOME_LINE_OFFSET;
    const oy = normalY * HOME_LINE_OFFSET;

    ctx.strokeStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(pAx + ox, pAy + oy);
    ctx.lineTo(pBx + ox, pBy + oy);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderHex(
  ctx: CanvasRenderingContext2D,
  state: HexGameState,
  vt: HexViewTransform,
  canvasW: number,
  canvasH: number,
  animProgress?: { lineAxis: string; lineIndex: number; t: number }
) {
  const { boardData, cellColors, colors, highlightLine, won } = state;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Home indicators — drawn first (behind cells)
  drawHexHomeIndicators(ctx, boardData.side, colors, vt);

  for (const cell of boardData.cells) {
    const verts = cell.vertices.map(([x, y]) => toScreen(x, y, vt));
    const [cx, cy] = toScreen(cell.centroid[0], cell.centroid[1], vt);
    const shrunk = shrinkCell(verts, cx, cy, CELL_SCALE);

    drawTriTile3D(ctx, shrunk, cellColors[cell.id]);

    // Highlight overlay
    if (highlightLine) {
      const lineIdx = boardData.cellToLine[highlightLine.axis]?.get(cell.id);
      if (lineIdx === highlightLine.lineIndex) {
        drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
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
  ctx.strokeStyle = won ? 'rgba(118, 255, 3, 0.5)' : 'rgba(0, 229, 255, 0.15)';
  ctx.lineWidth = 1.5;
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
