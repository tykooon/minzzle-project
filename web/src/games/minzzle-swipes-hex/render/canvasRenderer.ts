import { HexGameState, HexBoardData } from '../engine/types';

const BG = '#0d1117';
const SQRT3 = Math.sqrt(3);

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
    const color = cellColors[cell.id];

    const highlightedLineIdx = highlightLine ? boardData.cellToLine[highlightLine.axis]?.get(cell.id) : undefined;
    const isHighlighted = highlightLine && highlightedLineIdx === highlightLine.lineIndex;

    // Cell fill
    ctx.beginPath();
    ctx.moveTo(verts[0][0], verts[0][1]);
    ctx.lineTo(verts[1][0], verts[1][1]);
    ctx.lineTo(verts[2][0], verts[2][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Highlight overlay
    if (highlightLine) {
      const lineIdx = boardData.cellToLine[highlightLine.axis]?.get(cell.id);
      if (lineIdx === highlightLine.lineIndex) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
    }

    // Win shimmer
    if (won) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = won ? 'rgba(118, 255, 3, 0.4)' : 'rgba(150, 170, 190, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
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
