import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-6 py-5 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-body text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-display font-bold neon-text tracking-wider">
          {title}
        </h1>
      </header>

      <main className="flex-1 px-6 py-10">
        <article className="max-w-3xl mx-auto font-body text-foreground/90 space-y-6 leading-relaxed">
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          {children}
        </article>
      </main>

      <footer className="border-t border-border/50 px-6 py-6 text-center text-xs text-muted-foreground font-body">
        <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
        <span className="mx-2">·</span>
        <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
      </footer>
    </div>
  );
};

export default LegalPageLayout;
