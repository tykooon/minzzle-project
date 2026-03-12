import { type RefObject, type MutableRefObject, useEffect } from 'react';
import type { EditorState, EditorAction } from './editorTypes';
import type { ViewTransform } from '../render/canvasRenderer';
import { hitTestNode } from '../render/canvasRenderer';
import { editorStateToLevelData } from './editorRenderer';

function toWorld(screenX: number, screenY: number, vt: ViewTransform) {
  return {
    x: (screenX - vt.offsetX) / vt.scale,
    y: (screenY - vt.offsetY) / vt.scale,
  };
}

function snapToGrid(v: number, step = 0.5) {
  return Math.round(v / step) * step;
}

export function useEditorGestures(
  canvasRef: RefObject<HTMLCanvasElement>,
  editorStateRef: MutableRefObject<EditorState>,
  vtRef: MutableRefObject<ViewTransform>,
  dispatch: (action: EditorAction) => void,
  onRedraw: () => void,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    // Pan state
    let panning = false;
    let panStart = { x: 0, y: 0 };
    let panOrigin = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // Middle-click or Alt+left: start pan
        panning = true;
        panStart = getPos(e);
        panOrigin = { x: vtRef.current.offsetX, y: vtRef.current.offsetY };
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!panning) return;
      const pos = getPos(e);
      vtRef.current = {
        ...vtRef.current,
        offsetX: panOrigin.x + (pos.x - panStart.x),
        offsetY: panOrigin.y + (pos.y - panStart.y),
      };
      onRedraw();
    };

    const handleMouseUp = () => { panning = false; };

    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.altKey) return;
      const { x, y } = getPos(e);
      const editor = editorStateRef.current;
      const vt = vtRef.current;
      const level = editorStateToLevelData(editor);
      const hitNode = hitTestNode(level, vt, x, y);

      if (hitNode !== null) {
        if (editor.selectedNodeId === null) {
          dispatch({ type: 'SELECT_NODE', nodeId: hitNode });
        } else if (editor.selectedNodeId === hitNode) {
          dispatch({ type: 'DESELECT' });
        } else {
          dispatch({ type: 'ADD_EDGE', toNodeId: hitNode });
        }
      } else {
        const world = toWorld(x, y, vt);
        dispatch({ type: 'ADD_NODE', x: snapToGrid(world.x), y: snapToGrid(world.y) });
      }
      onRedraw();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const { x, y } = getPos(e);
      const editor = editorStateRef.current;
      const vt = vtRef.current;
      const level = editorStateToLevelData(editor);
      const hitNode = hitTestNode(level, vt, x, y);
      if (hitNode !== null) {
        dispatch({ type: 'REMOVE_NODE', nodeId: hitNode });
        onRedraw();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y } = getPos(e);
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const vt = vtRef.current;
      const newScale = Math.min(400, Math.max(20, vt.scale * factor));
      vtRef.current = {
        scale: newScale,
        offsetX: x - (x - vt.offsetX) * (newScale / vt.scale),
        offsetY: y - (y - vt.offsetY) * (newScale / vt.scale),
      };
      onRedraw();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []); // Empty deps intentional — reads fresh state via refs
}
