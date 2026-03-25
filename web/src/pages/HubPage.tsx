import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

const GAME_DISPLAY_META: Record<string, { icon: string; color: string; borderColor: string; description: string }> = {
  'minzzle-fives': {
    icon: '⬡',
    color: 'from-neon-cyan/20 to-neon-purple/20',
    borderColor: 'border-neon-cyan/30',
    description: 'Cover every edge in moves of exactly 5. Plan your path wisely.',
  },
  'minzzle-swipes': {
    icon: '⊞',
    color: 'from-neon-orange/20 to-neon-cyan/20',
    borderColor: 'border-neon-orange/30',
    description: 'Slide rows and columns to restore the color grid.',
  },
  'minzzle-swipes-hex': {
    icon: '⬡',
    color: 'from-neon-purple/20 to-neon-green/20',
    borderColor: 'border-neon-purple/30',
    description: 'Slide hexagonal lines to restore the color pattern.',
  },
};

const HubPage = () => {
  const navigate = useNavigate();
  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.getGames(),
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-5">
        <h1 className="text-3xl font-display font-bold neon-text tracking-wider">
          MINZZLE GAMES
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">
          Choose your puzzle
        </p>
      </header>

      {/* Games Grid */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="grid gap-6 max-w-2xl w-full">
          {(games ?? []).map((game, i) => {
            const meta = GAME_DISPLAY_META[game.id] ?? {
              icon: '?',
              color: 'from-muted/20 to-muted/20',
              borderColor: 'border-border',
              description: game.description,
            };
            return (
              <button
                key={game.id}
                onClick={() => navigate(`/${game.id}`)}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${meta.color} border ${meta.borderColor} p-8 text-left transition-all duration-300 hover:scale-[1.02] neon-box animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-6">
                  <span className="text-5xl">{meta.icon}</span>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground tracking-wide">
                      {game.name}
                    </h2>
                    <p className="text-muted-foreground mt-1 font-body text-sm">
                      {meta.description}
                    </p>
                    <span className="inline-block mt-3 text-xs font-body text-primary/70 border border-primary/20 rounded-full px-3 py-1">
                      {game.levelCount} levels
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HubPage;
