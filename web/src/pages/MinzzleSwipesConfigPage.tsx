import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SIZES = [
  { label: '4×4', rows: 4, cols: 4 },
  { label: '6×6', rows: 6, cols: 6 },
  { label: '8×8', rows: 8, cols: 8 },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
type Difficulty = typeof DIFFICULTIES[number];

const MinzzleSwipesConfigPage = () => {
  const navigate = useNavigate();
  const [sizeIdx, setSizeIdx] = useState(1); // default 4×4
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [seed, setSeed] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePlay = () => {
    const { rows, cols } = SIZES[sizeIdx];
    const resolvedSeed = seed.trim() || Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      rows: String(rows),
      cols: String(cols),
      difficulty: difficulty.toLowerCase(),
      seed: resolvedSeed,
    });
    navigate(`/minzzle-swipes/play?${params.toString()}`);
  };

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
          <h1 className="text-2xl font-display font-bold neon-text tracking-wider">MINZZLE SWIPES</h1>
          <p className="text-muted-foreground text-xs font-body">Configure your puzzle</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col gap-8">

          {/* Board Size */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-body text-muted-foreground uppercase tracking-widest">Board Size</span>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSizeIdx(i)}
                  className={`py-3 rounded-lg border font-body text-sm transition-all duration-200 ${
                    sizeIdx === i
                      ? 'border-neon-orange/60 bg-neon-orange/10 text-foreground'
                      : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-body text-muted-foreground uppercase tracking-widest">Difficulty</span>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-lg border font-body text-sm transition-all duration-200 ${
                    difficulty === d
                      ? 'border-neon-cyan/60 bg-neon-cyan/10 text-foreground'
                      : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced (seed) */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {showAdvanced ? '▾' : '▸'} Advanced
            </button>
            {showAdvanced && (
              <input
                type="text"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                placeholder="Seed (leave blank for random)"
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/40"
              />
            )}
          </div>

          {/* Play button */}
          <button
            onClick={handlePlay}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg tracking-wider hover:bg-primary/90 transition-colors"
          >
            PLAY
          </button>
        </div>
      </main>
    </div>
  );
};

export default MinzzleSwipesConfigPage;
