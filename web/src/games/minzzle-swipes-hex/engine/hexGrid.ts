import { HexCell, HexLineData, HexBoardData } from './types';

const SQRT3 = Math.sqrt(3);

function latticePoint(a: number, b: number): [number, number] {
  return [a + b * 0.5, b * SQRT3 / 2];
}

function isInsideHex(x: number, y: number, s: number): boolean {
  const ay = Math.abs(y);
  if (ay > s * SQRT3 / 2 + 1e-9) return false;
  if (Math.abs(SQRT3 * x + y) > s * SQRT3 + 1e-9) return false;
  if (Math.abs(SQRT3 * x - y) > s * SQRT3 + 1e-9) return false;
  return true;
}

export function generateHexBoard(side: number): HexBoardData {
  const cells: HexCell[] = [];
  let id = 0;
  const range = side + 1;

  for (let b = -range; b <= range; b++) {
    for (let a = -range * 2; a <= range * 2; a++) {
      // Upward triangle
      const v0u = latticePoint(a, b);
      const v1u = latticePoint(a + 1, b);
      const v2u = latticePoint(a, b + 1);
      const cxu = (v0u[0] + v1u[0] + v2u[0]) / 3;
      const cyu = (v0u[1] + v1u[1] + v2u[1]) / 3;
      if (isInsideHex(cxu, cyu, side)) {
        const angle = (Math.atan2(cyu, cxu) * 180 / Math.PI + 360) % 360;
        cells.push({
          id: id++, a, b, isUp: true,
          vertices: [v0u, v1u, v2u],
          centroid: [cxu, cyu],
          sector: Math.min(Math.floor(angle / 60), 5),
        });
      }

      // Downward triangle
      const v0d = latticePoint(a + 1, b);
      const v1d = latticePoint(a + 1, b + 1);
      const v2d = latticePoint(a, b + 1);
      const cxd = (v0d[0] + v1d[0] + v2d[0]) / 3;
      const cyd = (v0d[1] + v1d[1] + v2d[1]) / 3;
      if (isInsideHex(cxd, cyd, side)) {
        const angle = (Math.atan2(cyd, cxd) * 180 / Math.PI + 360) % 360;
        cells.push({
          id: id++, a, b, isUp: false,
          vertices: [v0d, v1d, v2d],
          centroid: [cxd, cyd],
          sector: Math.min(Math.floor(angle / 60), 5),
        });
      }
    }
  }

  const lines = generateLines(cells);
  const cellToLine: Record<string, Map<number, number>> = {
    horizontal: new Map(),
    diagR: new Map(),
    diagL: new Map(),
  };
  for (const line of lines) {
    for (const cid of line.cellIds) {
      cellToLine[line.axis].set(cid, line.index);
    }
  }

  return { side, cells, lines, cellToLine };
}

function lineKey(cell: HexCell, axis: 'horizontal' | 'diagR' | 'diagL'): number {
  const { a, b, isUp } = cell;
  switch (axis) {
    case 'horizontal': return b;
    case 'diagR': return a;
    case 'diagL': return isUp ? (a + b - 1) : (a + b);
  }
}

function sortProjection(cell: HexCell, axis: 'horizontal' | 'diagR' | 'diagL'): number {
  const [cx, cy] = cell.centroid;
  switch (axis) {
    case 'horizontal': return cx;
    case 'diagR': return cx * 0.5 + cy * SQRT3 / 2;
    case 'diagL': return -cx * 0.5 + cy * SQRT3 / 2;
  }
}

function generateLines(cells: HexCell[]): HexLineData[] {
  const lines: HexLineData[] = [];
  const axes: ('horizontal' | 'diagR' | 'diagL')[] = ['horizontal', 'diagR', 'diagL'];

  for (const axis of axes) {
    const groups = new Map<number, HexCell[]>();
    for (const cell of cells) {
      const key = lineKey(cell, axis);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(cell);
    }

    const sortedKeys = [...groups.keys()].sort((a, b) => a - b);
    sortedKeys.forEach((key, idx) => {
      const group = groups.get(key)!;
      group.sort((a, b) => sortProjection(a, axis) - sortProjection(b, axis));
      lines.push({
        axis,
        index: idx,
        cellIds: group.map(c => c.id),
      });
    });
  }

  return lines;
}
