import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useReducer, useRef, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/apiClient';
import { createSwipesInitialState, swipesReducer } from '@/games/minzzle-swipes/engine/reducer';
import {
  renderSwipes,
  computeSwipesFit,
  hitTestCell,
  SwipesViewTransform,
} from '@/games/minzzle-swipes/render/canvasRenderer';
import type { SwipesLevelData } from '@/games/minzzle-swipes/engine/types';

const SWIPE_THRESHOLD = 20;

// ── Inner game component (receives parsed board data) ──────────────────────────

interface SwipesGameProps {
  levelId: string;
  levelData: SwipesLevelData;
}

const SwipesGame = ({ levelData }: SwipesGameProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vtRef = useRef<SwipesViewTransform>({ offsetX: 0, offsetY: 0, cellSize: 60 });
  const [state, dispatch] = useReducer(swipesReducer, levelData, createSwipesInitialState);
  const dragStart = useRef<{ x: number; y: number; cell: [number, number] } | null>(null);
  const drawRef = useRef<() => void>(() => {});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    renderSwipes(ctx, state, vtRef.current, rect.width, rect.height);
    ctx.restore();
  }, [state]);

  useEffect(() => { drawRef.current = draw; }, [draw]);
  useEffect(() => { draw(); }, [draw]);

  const updateFit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    vtRef.current = computeSwipesFit(levelData.board.rows, levelData.board.cols, rect.width, rect.height);
    drawRef.current();
  }, [levelData]);

  useEffect(() => {
    updateFit();
    window.addEventListener('resize', updateFit);
    return () => window.removeEventListener('resize', updateFit);
  }, [updateFit]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasPos(e);
    if (!pos) return;
    const cell = hitTestCell(vtRef.current, state.board.rows, state.board.cols, pos.x, pos.y);
    if (cell) dragStart.current = { x: pos.x, y: pos.y, cell };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart.current) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    const dx = pos.x - dragStart.current.x;
    const dy = pos.y - dragStart.current.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        dispatch({ type: 'HIGHLIGHT', line: { type: 'row', index: dragStart.current.cell[0] } });
      } else {
        dispatch({ type: 'HIGHLIGHT', line: { type: 'col', index: dragStart.current.cell[1] } });
      }
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart.current) return;
    const canvas = canvasRef.current;
    if (!canvas) { dragStart.current = null; return; }
    const rect = canvas.getBoundingClientRect();
    let endX: number, endY: number;
    if ('changedTouches' in e) {
      endX = e.changedTouches[0].clientX - rect.left;
      endY = e.changedTouches[0].clientY - rect.top;
    } else {
      endX = e.clientX - rect.left;
      endY = e.clientY - rect.top;
    }
    const dx = endX - dragStart.current.x;
    const dy = endY - dragStart.current.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        dispatch({ type: 'SWIPE', move: { type: 'row', index: dragStart.current.cell[0] } });
      } else {
        dispatch({ type: 'SWIPE', move: { type: 'col', index: dragStart.current.cell[1] } });
      }
    }
    dispatch({ type: 'HIGHLIGHT', line: null });
    dragStart.current = null;
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border/50 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/minzzle-swipes')}
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            ← Levels
          </button>
          <h2 className="font-display text-lg font-bold neon-text tracking-wider">MINZZLE SWIPES</h2>
        </div>
        <div className="flex items-center gap-6 text-xs font-body">
          <div className="text-muted-foreground">
            Moves <span className="text-foreground font-semibold">{state.moveCount}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {state.won && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in-up">
            <div className="text-center">
              <h2
                className="text-4xl font-display font-black text-neon-green mb-2"
                style={{ textShadow: '0 0 20px rgba(118, 255, 3, 0.5), 0 0 40px rgba(118, 255, 3, 0.3)' }}
              >
                SOLVED!
              </h2>
              <p className="text-muted-foreground font-body text-sm mb-4">
                in {state.moveCount} moves
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="px-5 py-2 rounded-lg border border-border text-foreground font-body text-sm hover:bg-secondary transition-colors"
                >
                  Replay
                </button>
                <button
                  onClick={() => navigate('/minzzle-swipes')}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90 transition-colors"
                >
                  More Levels
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border/50 px-4 py-3 flex items-center justify-center gap-4 shrink-0">
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.history.length === 0}
          className="px-4 py-2 rounded-lg border border-border text-sm font-body text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Undo
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-4 py-2 rounded-lg border border-destructive/30 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
        >
          Restart
        </button>
      </footer>
    </div>
  );
};

// ── Page shell: fetch level from API, parse boardJson ──────────────────────────

const MinzzleSwipesPlayPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const { data: level, isLoading, isError } = useQuery({
    queryKey: ['minzzle-swipes', 'level', levelId],
    queryFn: () => api.getLevel('minzzle-swipes', levelId!),
    enabled: !!levelId,
  });

  const levelData = useMemo((): SwipesLevelData | null => {
    if (!level?.boardJson) return null;
    try {
      const board = JSON.parse(level.boardJson);
      return { schemaVersion: level.schemaVersion, title: level.name, board };
    } catch {
      return null;
    }
  }, [level]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body text-sm animate-pulse">Loading level…</p>
      </div>
    );
  }

  if (isError || !level || !levelData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-destructive font-body text-sm">Level not found.</p>
        <button
          onClick={() => navigate('/minzzle-swipes')}
          className="text-muted-foreground hover:text-foreground font-body text-sm"
        >
          ← Back to levels
        </button>
      </div>
    );
  }

  return <SwipesGame key={level.id} levelId={level.id} levelData={levelData} />;
};

export default MinzzleSwipesPlayPage;
