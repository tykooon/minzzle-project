import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { MinzzleFivesGame } from '../MinzzleFivesPlayPage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const GAME_ID = 'minzzle-fives';

const AdminLevelSolvePage = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pendingMoves, setPendingMoves] = useState<number[][] | null>(null);

  const { data: level, isLoading, isError } = useQuery({
    queryKey: ['admin', 'solve-level', levelId],
    queryFn: () => api.getLevel(GAME_ID, levelId!),
    enabled: !!levelId,
  });

  const saveMutation = useMutation({
    mutationFn: (moves: number[][]) =>
      api.saveLevelSolution(GAME_ID, levelId!, { solutionJson: JSON.stringify(moves) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'levels'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'solve-level', levelId] });
      navigate('/admin/levels');
    },
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
        <p className="text-destructive font-body text-sm">Level not found or server unavailable.</p>
        <button
          onClick={() => navigate('/admin/levels')}
          className="text-muted-foreground hover:text-foreground font-body text-sm transition-colors"
        >
          ← Back to levels
        </button>
      </div>
    );
  }

  return (
    <>
      <MinzzleFivesGame
        key={level.id}
        level={level}
        onSolved={setPendingMoves}
      />

      <AlertDialog open={pendingMoves !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save solution?</AlertDialogTitle>
            <AlertDialogDescription>
              You solved "{level.name}" in {pendingMoves?.length ?? 0} move
              {(pendingMoves?.length ?? 0) !== 1 ? 's' : ''}. Save this solution to the database?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMoves(null)}>Discard</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingMoves && saveMutation.mutate(pendingMoves)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save Solution'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminLevelSolvePage;
