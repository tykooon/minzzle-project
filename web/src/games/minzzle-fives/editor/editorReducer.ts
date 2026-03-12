import type { EditorState, EditorAction } from './editorTypes';

export function createEditorState(): EditorState {
  return { nodes: [], edges: [], selectedNodeId: null, nextNodeId: 0, nextEdgeId: 0 };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, { id: state.nextNodeId, x: action.x, y: action.y }],
        nextNodeId: state.nextNodeId + 1,
        selectedNodeId: null,
      };

    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId };

    case 'DESELECT':
      return { ...state, selectedNodeId: null };

    case 'ADD_EDGE': {
      const a = state.selectedNodeId;
      const b = action.toNodeId;
      if (a === null || a === b) return { ...state, selectedNodeId: null };
      const exists = state.edges.some(
        e => (e.a === a && e.b === b) || (e.a === b && e.b === a),
      );
      if (exists) return { ...state, selectedNodeId: null };
      return {
        ...state,
        edges: [...state.edges, { id: state.nextEdgeId, a, b }],
        nextEdgeId: state.nextEdgeId + 1,
        selectedNodeId: null,
      };
    }

    case 'REMOVE_NODE': {
      const nodes = state.nodes.filter(n => n.id !== action.nodeId);
      const edges = state.edges.filter(e => e.a !== action.nodeId && e.b !== action.nodeId);
      return { ...state, nodes, edges, selectedNodeId: null };
    }

    case 'REMOVE_EDGE':
      return { ...state, edges: state.edges.filter(e => e.id !== action.edgeId) };

    case 'LOAD_LEVEL': {
      const maxNodeId = action.nodes.reduce((m, n) => Math.max(m, n.id), -1);
      const maxEdgeId = action.edges.reduce((m, e) => Math.max(m, e.id), -1);
      return {
        nodes: action.nodes,
        edges: action.edges,
        selectedNodeId: null,
        nextNodeId: maxNodeId + 1,
        nextEdgeId: maxEdgeId + 1,
      };
    }

    case 'CLEAR':
      return createEditorState();

    default:
      return state;
  }
}
