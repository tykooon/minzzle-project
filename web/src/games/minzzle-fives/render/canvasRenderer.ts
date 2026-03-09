// Canvas renderer for Fillby5
import { GameState, LevelData, NodeData } from '../engine/types';

const COLORS = {
  bg: '#0d1117',
  edgeDefault: 'rgba(100, 120, 140, 0.25)',
  edgeUsed: '#00e5ff',
  edgeTrail: '#ff9100',
  edgeTrailGlow: 'rgba(255, 145, 0, 0.5)',
  nodeDefault: 'rgba(150, 170, 190, 0.5)',
  nodeActive: '#00e5ff',
  nodeTrailHead: '#ff9100',
  nodeFill: '#0d1117',
  winGlow: '#76ff03',
};

export interface ViewTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function computeAutoFit(level: LevelData, canvasW: number, canvasH: number): ViewTransform {
  if (level.nodes.length === 0) return { offsetX: 0, offsetY: 0, scale: 80 };
  const xs = level.nodes.map(n => n.x);
  const ys = level.nodes.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const padding = 80;
  const scaleX = (canvasW - padding * 2) / rangeX;
  const scaleY = (canvasH - padding * 2) / rangeY;
  const scale = Math.min(scaleX, scaleY, 120);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    offsetX: canvasW / 2 - centerX * scale,
    offsetY: canvasH / 2 - centerY * scale,
    scale,
  };
}

function toScreen(node: NodeData, vt: ViewTransform): [number, number] {
  return [node.x * vt.scale + vt.offsetX, node.y * vt.scale + vt.offsetY];
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  vt: ViewTransform,
  canvasW: number,
  canvasH: number
) {
  const { level, usedEdges, trailEdges, trailNodes, won } = state;
  const nodeMap = new Map(level.nodes.map(n => [n.id, n]));

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 1. Admissible edges (thin grey)
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.edgeDefault;
  ctx.lineCap = 'round';
  for (const edge of level.edges) {
    if (usedEdges.has(edge.id) || trailEdges.includes(edge.id)) continue;
    const a = nodeMap.get(edge.a)!;
    const b = nodeMap.get(edge.b)!;
    const [ax, ay] = toScreen(a, vt);
    const [bx, by] = toScreen(b, vt);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // 2. Used edges (thicker, cyan, glow)
  for (const edge of level.edges) {
    if (!usedEdges.has(edge.id)) continue;
    const a = nodeMap.get(edge.a)!;
    const b = nodeMap.get(edge.b)!;
    const [ax, ay] = toScreen(a, vt);
    const [bx, by] = toScreen(b, vt);

    // glow
    ctx.lineWidth = 8;
    ctx.strokeStyle = won ? 'rgba(118, 255, 3, 0.3)' : 'rgba(0, 229, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // line
    ctx.lineWidth = 3;
    ctx.strokeStyle = won ? COLORS.winGlow : COLORS.edgeUsed;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // 3. Trail edges (orange glow)
  for (const eid of trailEdges) {
    const edge = level.edges.find(e => e.id === eid);
    if (!edge) continue;
    const a = nodeMap.get(edge.a)!;
    const b = nodeMap.get(edge.b)!;
    const [ax, ay] = toScreen(a, vt);
    const [bx, by] = toScreen(b, vt);

    ctx.lineWidth = 10;
    ctx.strokeStyle = COLORS.edgeTrailGlow;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.edgeTrail;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // 4. Nodes
  const nodeRadius = Math.max(8, vt.scale * 0.08);
  for (const node of level.nodes) {
    const [sx, sy] = toScreen(node, vt);
    const isTrailHead = trailNodes.length > 0 && trailNodes[trailNodes.length - 1] === node.id;
    const isInTrail = trailNodes.includes(node.id);

    // Outer glow
    if (isTrailHead) {
      ctx.beginPath();
      ctx.arc(sx, sy, nodeRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 145, 0, 0.3)';
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(sx, sy, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.nodeFill;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isTrailHead
      ? COLORS.nodeTrailHead
      : isInTrail
        ? COLORS.edgeTrail
        : won
          ? COLORS.winGlow
          : COLORS.nodeDefault;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fillStyle = isTrailHead
      ? COLORS.nodeTrailHead
      : isInTrail
        ? COLORS.edgeTrail
        : 'rgba(150, 170, 190, 0.4)';
    ctx.fill();
  }
}

/** Find nearest node within a screen radius */
export function hitTestNode(
  level: LevelData,
  vt: ViewTransform,
  screenX: number,
  screenY: number,
  maxDist: number = 30
): number | null {
  let best: number | null = null;
  let bestDist = maxDist;
  for (const node of level.nodes) {
    const [sx, sy] = toScreen(node, vt);
    const d = Math.hypot(screenX - sx, screenY - sy);
    if (d < bestDist) {
      bestDist = d;
      best = node.id;
    }
  }
  return best;
}
