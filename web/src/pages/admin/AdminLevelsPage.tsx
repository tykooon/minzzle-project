import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const GAME_ID = 'minzzle-fives';

const AdminLevelsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: levels, isLoading } = useQuery({
    queryKey: ['admin', 'levels', GAME_ID],
    queryFn: () => api.getLevels(GAME_ID),
  });

  const deleteMutation = useMutation({
    mutationFn: (levelId: string) => api.deleteLevel(GAME_ID, levelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'levels'] }),
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Level Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Minzzle Fives</p>
        </div>
        <Button onClick={() => navigate('/admin/levels/new')}>+ New Level</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-24 text-center">Difficulty</TableHead>
              <TableHead className="w-20 text-center">Edges</TableHead>
              <TableHead className="w-20 text-center">Moves</TableHead>
              <TableHead className="w-24 text-center">Solution</TableHead>
              <TableHead className="w-48 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels?.map(level => (
              <TableRow key={level.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{level.id}</TableCell>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell className="text-center">{level.difficulty}</TableCell>
                <TableCell className="text-center">{level.edgeCount}</TableCell>
                <TableCell className="text-center">{level.estimatedMoves}</TableCell>
                <TableCell className="text-center">
                  {level.hasSolution
                    ? <span className="text-neon-green text-xs font-semibold">✓ Yes</span>
                    : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/levels/${level.id}/solve`)}
                    >
                      Solve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/levels/${level.id}`)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{level.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the level. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(level.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {levels?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No levels yet. Create one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminLevelsPage;
