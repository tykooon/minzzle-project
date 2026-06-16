import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/UserMenu';

/**
 * Gates a route behind authentication. With requireAdmin, also requires the
 * admin flag. Anonymous users are redirected home; logged-in non-admins see a
 * brief "access denied" with a way to switch accounts.
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-body">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-display font-bold neon-text">Access denied</h1>
        <p className="text-muted-foreground font-body max-w-sm">
          This area is for administrators only. You are signed in as a regular player.
        </p>
        <UserMenu />
      </div>
    );
  }

  return <>{children}</>;
}
