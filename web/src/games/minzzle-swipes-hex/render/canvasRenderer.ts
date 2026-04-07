import { HexGameState, HexBoardData, HexCell } from '../engine/types';

export interface HexAnimState {
  axis: 'horizontal' | 'diagL' | 'diagR';
  lineIndex: number;
  angle: number;      // 0 → Math.PI
  direction: number;  // +1 or -1
}

const DEPTH = 0.25;

const BG = '#070b12';
const SQRT3 = Math.sqrt(3);

const CELL_SCALE = 0.88;
const CORNER_RADIUS = 3;

const HOME_LINE_WIDTH = 5;
const HOME_LINE_OFFSET = 7;
const HOME_LINE_TRIM = 0.10;
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
 * Convex dome triangle tile.
 * isUp: apex at top — glare spot in lower-centre (wide base catches light).
 * !isUp: apex at bottom — glare spot in upper-centre (wide base at top).
 */
function drawTriTile3D(
  ctx: CanvasRenderingContext2D,
  shrunk: [number, number][],
  color: string,
  isUp: boolean
) {
  const xs = shrunk.map(v => v[0]);
  const ys = shrunk.map(v => v[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const tw = maxX - minX;
  const th = maxY - minY;
  const cx = minX + tw * 0.5;

  ctx.save();
  drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
  ctx.clip();

  // 1. Flat base
  ctx.fillStyle = color;
  ctx.fillRect(minX, minY, tw, th);

  // 2. Edge shadow at the apex edge (narrow end gets deeper shadow)
  const shadowY = isUp ? minY : maxY;
  const shadowDir = isUp ? 1 : -1;
  const apexShadow = ctx.createLinearGradient(minX, shadowY, minX, shadowY + shadowDir * th * 0.30);
  apexShadow.addColorStop(0,   'rgba(0,0,0,0.32)');
  apexShadow.addColorStop(0.5, 'rgba(0,0,0,0.10)');
  apexShadow.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = apexShadow;
  ctx.fillRect(minX, minY, tw, th);

  // 3. Convex dome glare — oval radial highlight
  //    isUp: glare sits lower-centre over wide base
  //    !isUp: glare sits upper-centre over wide base
  const glareY = isUp ? minY + th * 0.55 : minY + th * 0.35;
  const glare = ctx.createRadialGradient(
    cx, glareY, 0,
    cx, glareY, tw * 0.62
  );
  glare.addColorStop(0,    'rgba(255,255,255,0.52)');
  glare.addColorStop(0.25, 'rgba(255,255,255,0.28)');
  glare.addColorStop(0.55, 'rgba(255,255,255,0.07)');
  glare.addColorStop(0.80, 'rgba(255,255,255,0.01)');
  glare.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(minX, minY, tw, th);

  ctx.restore();
}

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

    const wA: [number, number] = [side * Math.cos(angleA), side * Math.sin(angleA)];
    const wB: [number, number] = [side * Math.cos(angleB), side * Math.sin(angleB)];

    const midAngle = (i * 60 + 30) * Math.PI / 180;
    const normalX =  Math.cos(midAngle);
    const normalY = -Math.sin(midAngle);

    const sA = toScreen(wA[0], wA[1], vt);
    const sB = toScreen(wB[0], wB[1], vt);

    const trim = HOME_LINE_TRIM;
    const pAx = sA[0] + (sB[0] - sA[0]) * trim;
    const pAy = sA[1] + (sB[1] - sA[1]) * trim;
    const pBx = sA[0] + (sB[0] - sA[0]) * (1 - trim);
    const pBy = sA[1] + (sB[1] - sA[1]) * (1 - trim);

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

interface AnimCellData {
  cell: HexCell;
  screenVerts: [number, number][];
  cx: number;
  cy: number;
  z: number;
}

function buildAnimLineData(
  boardData: HexBoardData,
  anim: HexAnimState,
  vt: HexViewTransform
): AnimCellData[] | null {
  const line = boardData.lines.find(l => l.axis === anim.axis && l.index === anim.lineIndex);
  if (!line || line.cellIds.length === 0) return null;

  const cells = line.cellIds.map(id => boardData.cells.find(c => c.id === id)!).filter(Boolean);

  // Screen centroids
  const sCentroids = cells.map(c => toScreen(c.centroid[0], c.centroid[1], vt));

  // Line center
  const lineCX = sCentroids.reduce((s, p) => s + p[0], 0) / sCentroids.length;
  const lineCY = sCentroids.reduce((s, p) => s + p[1], 0) / sCentroids.length;

  // Axis direction: vector from first to last centroid, normalised
  const first = sCentroids[0];
  const last = sCentroids[sCentroids.length - 1];
  const axLen = Math.sqrt((last[0] - first[0]) ** 2 + (last[1] - first[1]) ** 2);
  const axDir: [number, number] = axLen > 1
    ? [(last[0] - first[0]) / axLen, (last[1] - first[1]) / axLen]
    : [1, 0];

  // Each cell's offset ALONG the axis (same as Swipes dx/dy along row/col direction)
  const lineOffsets = sCentroids.map(([cx, cy]) =>
    (cx - lineCX) * axDir[0] + (cy - lineCY) * axDir[1]
  );
  const maxOffset = Math.max(...lineOffsets.map(Math.abs), 1);

  return cells.map((cell, i) => {
    const [cx, cy] = sCentroids[i];
    const lineOffset = lineOffsets[i];
    // Tiles arc along the line direction (rotate around axis perpendicular to the line)
    const projOffset = lineOffset * Math.cos(anim.angle);
    const z = anim.direction * lineOffset * Math.sin(anim.angle);
    const scale = 1 + DEPTH * (z / maxOffset);
    // Shift is along the line axis direction
    const shiftX = (projOffset - lineOffset) * axDir[0];
    const shiftY = (projOffset - lineOffset) * axDir[1];

    const screenVerts = cell.vertices.map(([vx, vy]) => {
      const [sx, sy] = toScreen(vx, vy, vt);
      const newCx = cx + shiftX;
      const newCy = cy + shiftY;
      return [newCx + (sx - cx) * scale, newCy + (sy - cy) * scale] as [number, number];
    });

    return { cell, screenVerts, cx: cx + shiftX, cy: cy + shiftY, z };
  });
}

export function renderHex(
  ctx: CanvasRenderingContext2D,
  state: HexGameState,
  vt: HexViewTransform,
  canvasW: number,
  canvasH: number,
  anim?: HexAnimState
) {
  const { boardData, cellColors, colors, highlightLine, won } = state;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  drawHexHomeIndicators(ctx, boardData.side, colors, vt);

  // Build animated line data upfront (null when no animation)
  const animLineData = anim ? buildAnimLineData(boardData, anim, vt) : null;
  const animCellIds = animLineData ? new Set(animLineData.map(d => d.cell.id)) : null;

  // Draw static cells (skip animated line)
  for (const cell of boardData.cells) {
    if (animCellIds?.has(cell.id)) continue;

    const verts = cell.vertices.map(([x, y]) => toScreen(x, y, vt));
    const [cx, cy] = toScreen(cell.centroid[0], cell.centroid[1], vt);
    const shrunk = shrinkCell(verts, cx, cy, CELL_SCALE);

    drawTriTile3D(ctx, shrunk, cellColors[cell.id], cell.isUp);

    if (highlightLine) {
      const lineIdx = boardData.cellToLine[highlightLine.axis]?.get(cell.id);
      if (lineIdx === highlightLine.lineIndex) {
        drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
        ctx.fillStyle = 'rgba(255,255,255,0.26)';
        ctx.fill();
      }
    }

    if (won) {
      drawRoundedTriangle(ctx, shrunk, CORNER_RADIUS);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fill();
    }
  }

  // Draw animated line cells sorted back-to-front
  if (animLineData) {
    const sorted = [...animLineData].sort((a, b) => a.z - b.z);
    for (const { cell, screenVerts, cx, cy } of sorted) {
      const shrunk = shrinkCell(screenVerts, cx, cy, CELL_SCALE);
      drawTriTile3D(ctx, shrunk, cellColors[cell.id], cell.isUp);
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
  ctx.strokeStyle = won ? 'rgba(118,255,3,0.5)' : 'rgba(0,229,255,0.12)';
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
