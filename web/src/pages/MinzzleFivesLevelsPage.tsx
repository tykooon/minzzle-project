import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/UserMenu';

const MinzzleFivesLevelsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: levels, isLoading, isError } = useQuery({
    queryKey: ['minzzle-fives', 'levels'],
    queryFn: () => api.getLevels('minzzle-fives'),
  });

  // Per-user progress — only fetched when signed in (endpoint requires auth).
  const { data: progress } = useQuery({
    queryKey: ['progress', 'minzzle-fives'],
    queryFn: () => api.getProgress('minzzle-fives'),
    enabled: !!user,
  });
  const solved = new Map((progress ?? []).filter((p) => p.completed).map((p) => [p.levelId, p]));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-6 py-5 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          ← Hub
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold neon-text tracking-wider">MINZZLE FIVES</h1>
          <p className="text-muted-foreground text-xs font-body">Select a level</p>
        </div>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        {isLoading && (
          <p className="text-muted-foreground font-body text-sm animate-pulse">Loading levels…</p>
        )}

        {isError && (
          <p className="text-destructive font-body text-sm">
            Could not load levels. Make sure the server is running.
          </p>
        )}

        {levels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
            {levels.map((level, i) => (
              <button
                key={level.id}
                onClick={() => navigate(`/minzzle-fives/play/${level.id}`)}
                className="group relative rounded-xl bg-card border border-border/50 p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-body text-muted-foreground uppercase tracking-widest">
                    Level {i + 1}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <div
                        key={si}
                        className={`w-1.5 h-1.5 rounded-full ${
                          si < level.difficulty ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground tracking-wide flex items-center gap-2">
                  {level.name}
                  {solved.has(level.id) && (
                    <span className="text-xs font-body text-neon-green border border-neon-green/40 rounded-full px-2 py-0.5">
                      ✓ Solved
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground font-body mt-2">
                  {level.edgeCount} edges · {level.estimatedMoves} moves
                  {solved.has(level.id) && ` · best ${solved.get(level.id)!.bestMoves}`}
                </p>
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MinzzleFivesLevelsPage;
