import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, AuthProvider as OAuthProvider, AuthUser } from '@/lib/apiClient';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginWith: (provider: OAuthProvider) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginWith = (provider: OAuthProvider) => {
    // Full-page navigation into the OAuth flow; returns to the current page after login.
    const returnUrl = window.location.pathname + window.location.search;
    window.location.href = authApi.loginUrl(provider, returnUrl || '/');
  };

  const logout = async () => {
    await authApi.logout();
    await queryClient.invalidateQueries();
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, loginWith, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
