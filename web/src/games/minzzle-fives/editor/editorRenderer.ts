import type { EditorState } from './editorTypes';
import type { LevelData } from '../engine/types';
import { createInitialState } from '../engine/reducer';
import { render, computeAutoFit } from '../render/canvasRenderer';
import type { ViewTransform } from '../render/canvasRenderer';

export function editorStateToLevelData(editor: EditorState): LevelData {
  return { schemaVersion: 1, moveLen: 5, nodes: editor.nodes, edges: editor.edges };
}

export function renderEditorCanvas(
  ctx: CanvasRenderingContext2D,
  editor: EditorState,
  vt: ViewTransform,
  canvasW: number,
  canvasH: number,
): void {
  const level = editorStateToLevelData(editor);
  const state = createInitialState(level);

  // Highlight selected node using the trail-head mechanism (shows orange)
  const stateWithSelection =
    editor.selectedNodeId !== null
      ? { ...state, trailNodes: [editor.selectedNodeId] }
      : state;

  render(ctx, stateWithSelection, vt, canvasW, canvasH);
}

export { computeAutoFit };
