import type { LevelFull } from '@/lib/apiClient';
import type { TutorialScript, TutorialStep } from '../types';

// solutionJson stores arrays of edge IDs (matching GameState.history format).
// We reconstruct the starting node of each chain by examining edge connectivity.
function getChainStartNode(edgeIds: number[], level: LevelFull): number {
  const edgeMap = new Map(level.edges.map(e => [e.id, e]));
  const firstEdge = edgeMap.get(edgeIds[0]);
  if (!firstEdge) return -1;

  if (edgeIds.length === 1) {
    // Single-edge chain: either endpoint works; pick the smaller id for determinism
    return Math.min(firstEdge.a, firstEdge.b);
  }

  const secondEdge = edgeMap.get(edgeIds[1]);
  if (!secondEdge) return firstEdge.a;

  // Shared node between first and second edge = second node of chain
  const sharedNode =
    firstEdge.a === secondEdge.a || firstEdge.a === secondEdge.b
      ? firstEdge.a
      : firstEdge.b;
  // Start node is the OTHER endpoint of the first edge
  return sharedNode === firstEdge.a ? firstEdge.b : firstEdge.a;
}

export function buildFivesTutorialScript(level: LevelFull): TutorialScript {
  if (!level.solutionJson) {
    return { gameKey: 'fives', steps: [] };
  }

  const solution: number[][] = JSON.parse(level.solutionJson);
  const totalChains = solution.length;

  const steps: TutorialStep[] = solution.map((edgeIds, i) => {
    const startNodeId = getChainStartNode(edgeIds, level);
    return {
      hint: i === 0
        ? `Tap and drag through ${level.moveLen} connected nodes to complete a chain. Start from the highlighted node.`
        : `Chain ${i + 1} of ${totalChains}: connect ${level.moveLen} more nodes.`,
      allowedAction: { kind: 'fives-step', nodeId: startNodeId },
    };
  });

  return { gameKey: 'fives', steps };
}
