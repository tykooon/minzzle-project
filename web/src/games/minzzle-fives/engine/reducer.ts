// Fillby5 game reducer
import { GameState, GameAction, LevelData } from './types';
import { findEdge } from './graph';

export function createInitialState(level: LevelData): GameState {
  return {
    level,
    usedEdges: new Set(),
    trailNodes: [],
    trailEdges: [],
    history: [],
    moveLen: level.moveLen,
    totalEdges: level.edges.length,
    won: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'STEP':
      return handleStep(state, action.nodeId);
    case 'CANCEL_MOVE':
      return cancelMove(state);
    case 'UNDO_MOVE':
      return undoMove(state);
    case 'RESET':
      return createInitialState(state.level);
    default:
      return state;
  }
}

function hasAvailableEdge(state: GameState, nodeId: number): boolean {
  return state.level.edges.some(
    e => (e.a === nodeId || e.b === nodeId) && !state.usedEdges.has(e.id)
  );
}

function handleStep(state: GameState, nodeId: number): GameState {
  if (state.won) return state;

  // If no trail yet, start from this node (only if it has unused edges)
  if (state.trailNodes.length === 0) {
    if (!hasAvailableEdge(state, nodeId)) return state;
    return { ...state, trailNodes: [nodeId], trailEdges: [] };
  }

  const lastNode = state.trailNodes[state.trailNodes.length - 1];
  if (lastNode === nodeId) return state;

  // Check backtrack: if nodeId is the second-to-last node, undo last trail step
  if (state.trailNodes.length >= 2 && state.trailNodes[state.trailNodes.length - 2] === nodeId) {
    const newTrailNodes = state.trailNodes.slice(0, -1);
    const newTrailEdges = state.trailEdges.slice(0, -1);
    return { ...state, trailNodes: newTrailNodes, trailEdges: newTrailEdges };
  }

  // Find edge between lastNode and nodeId
  const edge = findEdge(state.level, lastNode, nodeId);
  if (!edge) {
    // Non-adjacent: cancel current trail, start fresh from clicked node (if it has available edges)
    if (!hasAvailableEdge(state, nodeId)) return state;
    return { ...state, trailNodes: [nodeId], trailEdges: [] };
  }

  // Check if edge already used (committed)
  if (state.usedEdges.has(edge.id)) return state;

  // Check if edge already in current trail
  if (state.trailEdges.includes(edge.id)) return state;

  // Add to trail
  const newTrailNodes = [...state.trailNodes, nodeId];
  const newTrailEdges = [...state.trailEdges, edge.id];

  // Auto-commit at moveLen
  if (newTrailEdges.length === state.moveLen) {
    const newUsedEdges = new Set(state.usedEdges);
    for (const eid of newTrailEdges) newUsedEdges.add(eid);
    const newHistory = [...state.history, newTrailEdges];
    const won = newUsedEdges.size === state.totalEdges;
    return {
      ...state,
      usedEdges: newUsedEdges,
      trailNodes: [],
      trailEdges: [],
      history: newHistory,
      won,
    };
  }

  return { ...state, trailNodes: newTrailNodes, trailEdges: newTrailEdges };
}

function cancelMove(state: GameState): GameState {
  return { ...state, trailNodes: [], trailEdges: [] };
}

function undoMove(state: GameState): GameState {
  if (state.history.length === 0) return state;

  // Cancel current trail first
  const newHistory = state.history.slice(0, -1);
  const lastMove = state.history[state.history.length - 1];
  const newUsedEdges = new Set(state.usedEdges);
  for (const eid of lastMove) newUsedEdges.delete(eid);

  return {
    ...state,
    usedEdges: newUsedEdges,
    trailNodes: [],
    trailEdges: [],
    history: newHistory,
    won: false,
  };
}
