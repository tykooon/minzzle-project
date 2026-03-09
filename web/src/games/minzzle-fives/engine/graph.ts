// Graph utilities for Fillby5
import { LevelData, EdgeData } from './types';

/** Build adjacency: nodeId -> array of { edgeId, neighborId } */
export function buildAdjacency(level: LevelData): Map<number, { edgeId: number; neighbor: number }[]> {
  const adj = new Map<number, { edgeId: number; neighbor: number }[]>();
  for (const node of level.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of level.edges) {
    adj.get(edge.a)!.push({ edgeId: edge.id, neighbor: edge.b });
    adj.get(edge.b)!.push({ edgeId: edge.id, neighbor: edge.a });
  }
  return adj;
}

/** Find edge between two nodes, or undefined */
export function findEdge(level: LevelData, a: number, b: number): EdgeData | undefined {
  return level.edges.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}
