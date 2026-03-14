import { LevelData } from './types';

export const MOVE_PALETTE = [
  '#00e5ff', // aqua blue
  '#b2ff59', // lime
  '#ffd740', // amber
  '#ff9100', // orange
  '#ff6e40', // deep orange
  '#f48fb1', // pink
  '#ce93d8', // purple
  '#69f0ae', // mint green
  '#4fc3f7', // sky blue
  '#aed581', // light green
  '#fff176', // light yellow
  '#ffcc80', // peach
  '#80cbc4', // muted teal
  '#ef9a9a', // light red
  '#00bfa5', // teal
];

/**
 * Assign a color to each move in history using greedy graph coloring.
 * Two moves are "adjacent" if they share at least one node.
 * Returns an array of color strings, one per move, in history order.
 */
export function assignMoveColors(history: number[][], level: LevelData): string[] {
  // Build node set for each move
  const moveNodeSets = history.map(edgeIds => {
    const nodes = new Set<number>();
    for (const eid of edgeIds) {
      const edge = level.edges.find(e => e.id === eid);
      if (edge) {
        nodes.add(edge.a);
        nodes.add(edge.b);
      }
    }
    return nodes;
  });

  const colors: string[] = [];
  for (let i = 0; i < history.length; i++) {
    // Collect colors used by adjacent earlier moves
    const usedColors = new Set<string>();
    for (let j = 0; j < i; j++) {
      const sharesNode = [...moveNodeSets[i]].some(n => moveNodeSets[j].has(n));
      if (sharesNode) usedColors.add(colors[j]);
    }
    // Pick first available palette color; wrap around as fallback
    const color = MOVE_PALETTE.find(c => !usedColors.has(c)) ?? MOVE_PALETTE[i % MOVE_PALETTE.length];
    colors.push(color);
  }
  return colors;
}
