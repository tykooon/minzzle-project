import { useReducer, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/apiClient';
import { editorReducer, createEditorState } from '@/games/minzzle-fives/editor/editorReducer';
import { renderEditorCanvas, editorStateToLevelData, computeAutoFit } from '@/games/minzzle-fives/editor/editorRenderer';
import { useEditorGestures } from '@/games/minzzle-fives/editor/useEditorGestures';
import type { ViewTransform } from '@/games/minzzle-fives/render/canvasRenderer';
import type { EditorState } from '@/games/minzzle-fives/editor/editorTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GAME_ID = 'minzzle-fives';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  difficulty: z.coerce.number().int().min(1).max(5),
  moveLen: z.coerce.number().int().min(1),
});

type FormValues = z.infer<typeof formSchema>;

const AdminLevelEditorPage = () => {
  const { levelId } = useParams<{ levelId?: string }>();
  const isNew = !levelId || levelId === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vtRef = useRef<ViewTransform>({ offsetX: 0, offsetY: 0, scale: 80 });

  // Editor state
  const [editorState, dispatch] = useReducer(editorReducer, undefined, createEditorState);
  const editorStateRef = useRef<EditorState>(editorState);
  editorStateRef.current = editorState;

  // Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', difficulty: 1, moveLen: 5 },
  });

  // Load existing level
  const { data: existingLevel } = useQuery({
    queryKey: ['level', levelId],
    queryFn: () => api.getLevel(GAME_ID, levelId!),
    enabled: !isNew && !!levelId,
  });

  useEffect(() => {
    if (!existingLevel) return;
    dispatch({ type: 'LOAD_LEVEL', nodes: existingLevel.nodes, edges: existingLevel.edges });
    reset({ name: existingLevel.name, difficulty: existingLevel.difficulty, moveLen: existingLevel.moveLen });
  }, [existingLevel, reset]);

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio ?? 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.save();
    ctx.scale(dpr, dpr);
    renderEditorCanvas(ctx, editorStateRef.current, vtRef.current, w, h);
    ctx.restore();
  }, []);

  // Auto-fit when a level is loaded
  useEffect(() => {
    if (!existingLevel) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    vtRef.current = computeAutoFit(
      editorStateToLevelData({ ...createEditorState(), nodes: existingLevel.nodes, edges: existingLevel.edges }),
      canvas.clientWidth,
      canvas.clientHeight,
    );
    redraw();
  }, [existingLevel, redraw]);

  // Redraw whenever editor state changes
  useEffect(() => { redraw(); }, [editorState, redraw]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => redraw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  // Editor gestures
  useEditorGestures(canvasRef, editorStateRef, vtRef, dispatch, redraw);

  // Save
  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        difficulty: values.difficulty,
        schemaVersion: 1,
        moveLen: values.moveLen,
        nodes: editorStateRef.current.nodes,
        edges: editorStateRef.current.edges,
      };
      return isNew
        ? api.createLevel(GAME_ID, payload)
        : api.updateLevel(GAME_ID, levelId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'levels'] });
      navigate('/admin/levels');
    },
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate('/admin/levels')}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Levels
        </button>
        <h1 className="font-bold text-lg">
          {isNew ? 'New Level' : `Edit: ${existingLevel?.name ?? levelId}`}
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onContextMenu={e => e.preventDefault()}
          />
          <div className="absolute top-3 left-3 text-xs text-white/50 bg-black/40 rounded px-2 py-1 pointer-events-none select-none">
            Click → place / select / connect node · Right-click → delete node · Scroll → zoom · Alt+drag → pan
          </div>
          <div className="absolute bottom-3 left-3 text-xs text-white/50 bg-black/40 rounded px-2 py-1 pointer-events-none select-none">
            Nodes: {editorState.nodes.length} · Edges: {editorState.edges.length}
            {editorState.selectedNodeId !== null && ` · Selected: #${editorState.selectedNodeId}`}
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-80 border-l flex flex-col overflow-y-auto shrink-0">
          <form
            onSubmit={handleSubmit(values => saveMutation.mutate(values))}
            className="flex flex-col gap-4 p-6"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} placeholder="Level name" />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="difficulty">Difficulty (1–5)</Label>
              <Input id="difficulty" type="number" min={1} max={5} {...register('difficulty')} />
              {errors.difficulty && <p className="text-destructive text-xs">{errors.difficulty.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="moveLen">Move Length</Label>
              <Input id="moveLen" type="number" min={1} {...register('moveLen')} />
              {errors.moveLen && <p className="text-destructive text-xs">{errors.moveLen.message}</p>}
            </div>

            {/* Edge list */}
            <div className="space-y-1">
              <Label>Edges ({editorState.edges.length})</Label>
              <div className="border rounded overflow-y-auto max-h-52 p-2 space-y-1 bg-muted/30">
                {editorState.edges.length === 0 ? (
                  <p className="text-muted-foreground text-xs py-1">No edges yet</p>
                ) : (
                  editorState.edges.map(edge => (
                    <div key={edge.id} className="flex justify-between items-center text-xs">
                      <span className="font-mono text-muted-foreground">
                        #{edge.id}: {edge.a} ↔ {edge.b}
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'REMOVE_EDGE', edgeId: edge.id })}
                        className="text-destructive hover:text-destructive/70 ml-2 font-bold leading-none"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'CLEAR' })}
            >
              Clear Canvas
            </Button>

            {saveMutation.isError && (
              <p className="text-destructive text-xs">Save failed. Check console.</p>
            )}

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : isNew ? 'Create Level' : 'Save Changes'}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default AdminLevelEditorPage;
