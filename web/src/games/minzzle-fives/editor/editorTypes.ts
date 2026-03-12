import type { NodeData, EdgeData } from '../engine/types';

export interface EditorState {
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNodeId: number | null;
  nextNodeId: number;
  nextEdgeId: number;
}

export type EditorAction =
  | { type: 'ADD_NODE'; x: number; y: number }
  | { type: 'SELECT_NODE'; nodeId: number }
  | { type: 'DESELECT' }
  | { type: 'ADD_EDGE'; toNodeId: number }
  | { type: 'REMOVE_NODE'; nodeId: number }
  | { type: 'REMOVE_EDGE'; edgeId: number }
  | { type: 'LOAD_LEVEL'; nodes: NodeData[]; edges: EdgeData[] }
  | { type: 'CLEAR' };
