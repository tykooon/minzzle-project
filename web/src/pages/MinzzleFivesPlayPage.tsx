import { useParams, useNavigate } from 'react-router-dom';
import { useReducer, useRef, useEffect, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, LevelFull } from '@/lib/apiClient';
import { createInitialState, gameReducer } from '../games/minzzle-fives/engine/reducer';
import { render, computeAutoFit, hitTestNode, ViewTransform } from '../games/minzzle-fives/render/canvasRenderer';
import { useGestures } from '../games/minzzle-fives/input/useGestures';

// ── Game canvas (only rendered once level is loaded) ─────────────────

const MinzzleFivesGame = ({ level }: { level: LevelFull }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vtRef = useRef<ViewTransform>({ offsetX: 0, offsetY: 0, scale: 80 });
  const [state, dispatch] = useReducer(gameReducer, level, createInitialState);
  const [vtVersion, setVtVersion] = useState(0);
  const triggerRender = useCallback(() => setVtVersion(v => v + 1), []);

  useGestures(canvasRef, level, vtRef, dispatch, triggerRender);

  const updateFit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    vtRef.current = computeAutoFit(level, rect.width, rect.height);
  }, [level]);

  useEffect(() => {
    updateFit();
    window.addEventListener('resize', updateFit);
    return () => window.removeEventListener('resize', updateFit);
  }, [updateFit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    render(ctx, state, vtRef.current, rect.width, rect.height);
    ctx.restore();
  }, [state, vtVersion]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeId = hitTestNode(level, vtRef.current, x, y);
    if (nodeId !== null) dispatch({ type: 'STEP', nodeId });
  };

  const progress = state.usedEdges.size;
  const total = state.totalEdges;
  const movesUsed = state.history.length;
  const totalMoves = total / state.moveLen;
  const inTrail = state.trailEdges.length;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* HUD */}
      <header className="border-b border-border/50 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/minzzle-fives')}
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            ← Levels
          </button>
          <h2 className="font-display text-lg font-bold neon-text tracking-wider">MINZZLE FIVES</h2>
        </div>

        <div className="flex items-center gap-6 text-xs font-body">
          <div className="text-muted-foreground">
            Edges <span className="text-foreground font-semibold">{progress}/{total}</span>
          </div>
          <div className="text-muted-foreground">
            Moves <span className="text-foreground font-semibold">{movesUsed}/{totalMoves}</span>
          </div>
          {inTrail > 0 && (
            <div className="text-neon-orange font-semibold">
              Trail {inTrail}/{state.moveLen}
            </div>
          )}
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none"
          onClick={handleCanvasClick}
        />

        {/* Win overlay */}
        {state.won && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in-up">
            <div className="text-center">
              <h2
                className="text-4xl font-display font-black text-neon-green mb-4"
                style={{ textShadow: '0 0 20px rgba(118, 255, 3, 0.5), 0 0 40px rgba(118, 255, 3, 0.3)' }}
              >
                SOLVED!
              </h2>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="px-5 py-2 rounded-lg border border-border text-foreground font-body text-sm hover:bg-secondary transition-colors"
                >
                  Replay
                </button>
                <button
                  onClick={() => navigate('/minzzle-fives')}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90 transition-colors"
                >
                  More Levels
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <footer className="border-t border-border/50 px-4 py-3 flex items-center justify-center gap-4 shrink-0">
        <button
          onClick={() => dispatch({ type: 'CANCEL_MOVE' })}
          disabled={state.trailEdges.length === 0}
          className="px-4 py-2 rounded-lg border border-border text-sm font-body text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Cancel Move
        </button>
        <button
          onClick={() => dispatch({ type: 'UNDO_MOVE' })}
          disabled={state.history.length === 0}
          className="px-4 py-2 rounded-lg border border-border text-sm font-body text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Undo Last
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-4 py-2 rounded-lg border border-destructive/30 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
        >
          Reset
        </button>
      </footer>
    </div>
  );
};

// ── Page (handles loading / error before game mounts) ─────────────────

const MinzzleFivesPlayPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const { data: level, isLoading, isError } = useQuery({
    queryKey: ['minzzle-fives', 'level', levelId],
    queryFn: () => api.getLevel('minzzle-fives', levelId!),
    enabled: !!levelId,
  });

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body text-sm animate-pulse">Loading level…</p>
      </div>
    );
  }

  if (isError || !level) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-body text-sm">
          Level not found or server unavailable.
        </p>
        <button
          onClick={() => navigate('/minzzle-fives')}
          className="text-muted-foreground hover:text-foreground font-body text-sm transition-colors"
        >
          ← Back to levels
        </button>
      </div>
    );
  }

  return <MinzzleFivesGame key={level.id} level={level} />;
};

export default MinzzleFivesPlayPage;
