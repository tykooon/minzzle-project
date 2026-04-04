import { useSearchParams, useNavigate } from 'react-router-dom';
import { useReducer, useRef, useEffect, useCallback } from 'react';
import { makeRng } from '@/lib/seededRandom';
import { generateHexBoard } from '@/games/minzzle-swipes-hex/engine/hexGrid';
import { createHexInitialState, hexReducer } from '@/games/minzzle-swipes-hex/engine/reducer';
import {
  renderHex,
  computeHexFit,
  hitTestHexCell,
  snapToAxis,
  HexViewTransform,
} from '@/games/minzzle-swipes-hex/render/canvasRenderer';
import type { HexLevelData } from '@/games/minzzle-swipes-hex/engine/types';

const SWIPE_THRESHOLD = 20;

// ── Inner game component ───────────────────────────────────────────────────────

interface HexGameProps {
  levelId: string;
  levelData: HexLevelData;
}

const HexGame = ({ levelData }: HexGameProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vtRef = useRef<HexViewTransform>({ offsetX: 0, offsetY: 0, scale: 80 });
  const [state, dispatch] = useReducer(hexReducer, levelData, createHexInitialState);
  const dragStart = useRef<{ x: number; y: number; cellId: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    renderHex(ctx, state, vtRef.current, rect.width, rect.height);
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
    vtRef.current = computeHexFit(levelData.side, rect.width, rect.height);
    drawRef.current();
  }, [levelData]);

  useEffect(() => {
    updateFit();
    window.addEventListener('resize', updateFit);
    return () => window.removeEventListener('resize', updateFit);
  }, [updateFit]);

  const flashLine = useCallback((axis: 'horizontal' | 'diagL' | 'diagR', lineIndex: number) => {
    dispatch({ type: 'HIGHLIGHT', line: { axis, lineIndex } });
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = performance.now();
    const tick = (now: number) => {
      if (now - start >= 250) {
        dispatch({ type: 'HIGHLIGHT', line: null });
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

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
    const cellId = hitTestHexCell(state.boardData, vtRef.current, pos.x, pos.y);
    if (cellId !== null) dragStart.current = { x: pos.x, y: pos.y, cellId };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart.current) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    const dx = pos.x - dragStart.current.x;
    const dy = pos.y - dragStart.current.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
      const axis = snapToAxis(dx, -dy);
      const lineIdx = state.boardData.cellToLine[axis]?.get(dragStart.current.cellId);
      if (lineIdx !== undefined) {
        dispatch({ type: 'HIGHLIGHT', line: { axis, lineIndex: lineIdx } });
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
      const axis = snapToAxis(dx, -dy);
      const lineIdx = state.boardData.cellToLine[axis]?.get(dragStart.current.cellId);
      if (lineIdx !== undefined) {
        dispatch({ type: 'SWIPE', move: { axis, lineIndex: lineIdx } });
        flashLine(axis, lineIdx);
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
            onClick={() => navigate('/minzzle-swipes-hex')}
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            ← Config
          </button>
          <h2 className="font-display text-lg font-bold neon-text tracking-wider">SWIPES HEX</h2>
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
                  onClick={() => navigate('/minzzle-swipes-hex')}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90 transition-colors"
                >
                  New Puzzle
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

// ── Page shell: generate puzzle from URL search params ─────────────────────────

const HEX_SCRAMBLE_COUNTS: Record<string, number> = { easy: 6, medium: 25, hard: 100 };
const HEX_COLORS = ['#2D63D9', '#D9B300', '#27A84A', '#D92B2F', '#F08A12', '#E9EDF5'];

const MinzzleSwipesHexPlayPage = () => {
  const [params] = useSearchParams();
  const side = Math.max(2, Number(params.get('side') ?? 3));
  const difficulty = params.get('difficulty') ?? 'medium';
  const seed = params.get('seed') ?? 'default';

  const scrambleCount = HEX_SCRAMBLE_COUNTS[difficulty] ?? 12;
  const rng = makeRng(seed);

  const boardData = generateHexBoard(side);
  const scrambleMoves: HexLevelData['scrambleMoves'] = Array.from({ length: scrambleCount }, () => {
    const line = boardData.lines[Math.floor(rng() * boardData.lines.length)];
    return { axis: line.axis, lineIndex: line.index };
  });

  const levelData: HexLevelData = {
    schemaVersion: 1,
    title: '',
    side,
    colors: HEX_COLORS,
    scrambleMoves,
  };

  return <HexGame key={seed + side + difficulty} levelId={seed} levelData={levelData} />;
};

export default MinzzleSwipesHexPlayPage;
