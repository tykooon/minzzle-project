import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

const GAME_ID = 'minzzle-fives';

const gameInfo = {
  id: GAME_ID,
  name: 'Minzzle Fives',
  description: 'Cover every edge in moves of exactly 5. Plan your path wisely.',
  icon: '⬡',
  color: 'from-neon-cyan/20 to-neon-purple/20',
  borderColor: 'border-neon-cyan/30',
};

const HubPage = () => {
  const navigate = useNavigate();
  const { data: levels } = useQuery({
    queryKey: [GAME_ID, 'levels'],
    queryFn: () => api.getLevels(GAME_ID),
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
          {[gameInfo].map((game, i) => (
            <button
              key={game.id}
              onClick={() => navigate(`/${game.id}`)}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${game.color} border ${game.borderColor} p-8 text-left transition-all duration-300 hover:scale-[1.02] neon-box animate-fade-in-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-6">
                <span className="text-5xl">{game.icon}</span>
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground tracking-wide">
                    {game.name}
                  </h2>
                  <p className="text-muted-foreground mt-1 font-body text-sm">
                    {game.description}
                  </p>
                  <span className="inline-block mt-3 text-xs font-body text-primary/70 border border-primary/20 rounded-full px-3 py-1">
                    {levels ? `${levels.length} levels` : '…'}
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HubPage;
