/**
 * useGestures — touch interaction for the Fillby5 canvas.
 *
 * Single finger:
 *   - Drag across nodes → dispatches STEP as each new node is entered.
 *   - Drag on empty space → pans the viewport.
 *
 * Two fingers:
 *   - Pinch → zooms the viewport toward the pinch midpoint.
 *   - Drag (both fingers) → pans while zooming.
 *
 * Listeners are attached as non-passive so preventDefault() can suppress
 * the browser's own scroll/zoom behaviour.
 */

import { MutableRefObject, RefObject, useEffect, useRef } from 'react';
import { LevelData, GameAction } from '../engine/types';
import { ViewTransform, hitTestNode } from '../render/canvasRenderer';

/** Touch snap radius in CSS pixels — larger than mouse to suit fingertips. */
const TOUCH_SNAP_PX = 50;
/** Clamp scale to a sensible range. */
const MIN_SCALE = 20;
const MAX_SCALE = 400;

interface GestureState {
  lastSnappedNode: number | null;
  isPanning: boolean;
  panStartPos: { x: number; y: number };
  panStartOffset: { x: number; y: number };
  pinchStartDist: number;
  pinchStartScale: number;
  pinchStartMid: { x: number; y: number };
  pinchStartOffset: { x: number; y: number };
}

function makeGestureState(): GestureState {
  return {
    lastSnappedNode: null,
    isPanning: false,
    panStartPos: { x: 0, y: 0 },
    panStartOffset: { x: 0, y: 0 },
    pinchStartDist: 1,
    pinchStartScale: 80,
    pinchStartMid: { x: 0, y: 0 },
    pinchStartOffset: { x: 0, y: 0 },
  };
}

export function useGestures(
  canvasRef: RefObject<HTMLCanvasElement>,
  level: LevelData,
  vtRef: MutableRefObject<ViewTransform>,
  dispatch: (action: GameAction) => void,
  /** Call this whenever vtRef.current is mutated to trigger a canvas re-render. */
  onVtChange: () => void,
): void {
  // Keep latest callbacks/data in refs so the single useEffect closure stays fresh.
  const dispatchRef = useRef(dispatch);
  const onVtChangeRef = useRef(onVtChange);
  const levelRef = useRef(level);
  dispatchRef.current = dispatch;
  onVtChangeRef.current = onVtChange;
  levelRef.current = level;

  const gs = useRef<GestureState>(makeGestureState());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── helpers ────────────────────────────────────────────────────────

    const getPos = (touch: Touch): { x: number; y: number } => {
      const r = canvas.getBoundingClientRect();
      return { x: touch.clientX - r.left, y: touch.clientY - r.top };
    };

    const touchDist = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const touchMid = (t1: Touch, t2: Touch): { x: number; y: number } => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (t1.clientX + t2.clientX) / 2 - r.left,
        y: (t1.clientY + t2.clientY) / 2 - r.top,
      };
    };

    // ── handlers ───────────────────────────────────────────────────────

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const g = gs.current;
      const vt = vtRef.current;

      if (e.touches.length === 1) {
        const pos = getPos(e.touches[0]);
        const nodeId = hitTestNode(levelRef.current, vt, pos.x, pos.y, TOUCH_SNAP_PX);

        if (nodeId !== null) {
          g.lastSnappedNode = nodeId;
          g.isPanning = false;
          dispatchRef.current({ type: 'STEP', nodeId });
        } else {
          g.isPanning = true;
          g.lastSnappedNode = null;
          g.panStartPos = pos;
          g.panStartOffset = { x: vt.offsetX, y: vt.offsetY };
        }
      } else if (e.touches.length === 2) {
        // Entering two-finger mode — cancel any single-finger gesture.
        g.isPanning = false;
        g.lastSnappedNode = null;
        g.pinchStartDist = touchDist(e.touches[0], e.touches[1]);
        g.pinchStartScale = vt.scale;
        g.pinchStartMid = touchMid(e.touches[0], e.touches[1]);
        g.pinchStartOffset = { x: vt.offsetX, y: vt.offsetY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const g = gs.current;
      const vt = vtRef.current;

      if (e.touches.length === 1) {
        const pos = getPos(e.touches[0]);

        if (g.isPanning) {
          vt.offsetX = g.panStartOffset.x + (pos.x - g.panStartPos.x);
          vt.offsetY = g.panStartOffset.y + (pos.y - g.panStartPos.y);
          onVtChangeRef.current();
        } else {
          // Snap to next node along the drag path.
          const nodeId = hitTestNode(levelRef.current, vt, pos.x, pos.y, TOUCH_SNAP_PX);
          if (nodeId !== null && nodeId !== g.lastSnappedNode) {
            g.lastSnappedNode = nodeId;
            dispatchRef.current({ type: 'STEP', nodeId });
          }
        }
      } else if (e.touches.length === 2) {
        const newDist = touchDist(e.touches[0], e.touches[1]);
        const newMid = touchMid(e.touches[0], e.touches[1]);
        const newScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, g.pinchStartScale * (newDist / g.pinchStartDist)),
        );
        const scaleRatio = newScale / g.pinchStartScale;

        // Zoom toward the starting pinch midpoint, then apply any pan delta.
        vt.scale = newScale;
        vt.offsetX = newMid.x + (g.pinchStartOffset.x - g.pinchStartMid.x) * scaleRatio;
        vt.offsetY = newMid.y + (g.pinchStartOffset.y - g.pinchStartMid.y) * scaleRatio;
        onVtChangeRef.current();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const g = gs.current;
      // If we're back to fewer than 2 fingers, reset single-finger tracking.
      if (e.touches.length < 2) {
        g.lastSnappedNode = null;
        g.isPanning = false;
      }
      // If lifted all fingers, full reset.
      if (e.touches.length === 0) {
        gs.current = makeGestureState();
      }
    };

    // ── attach ─────────────────────────────────────────────────────────

    const opts: AddEventListenerOptions = { passive: false };
    canvas.addEventListener('touchstart', onTouchStart, opts);
    canvas.addEventListener('touchmove', onTouchMove, opts);
    canvas.addEventListener('touchend', onTouchEnd, opts);
    canvas.addEventListener('touchcancel', onTouchEnd, opts);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps intentional: all mutable values accessed through refs.
}
