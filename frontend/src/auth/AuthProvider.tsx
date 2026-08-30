import { useApolloClient } from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ME_QUERY } from '../graphql/queries/auth';

const tokenKey = 'finance-tracker-token';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(tokenKey);
    if (!token) {
      setIsLoading(false);
      return;
    }

    void client
      .query<{ me: AuthUser }>({ query: ME_QUERY, fetchPolicy: 'network-only' })
      .then(({ data }) => {
        if (!data?.me) throw new Error('Session could not be restored');
        setUser(data.me);
      })
      .catch(() => sessionStorage.removeItem(tokenKey))
      .finally(() => setIsLoading(false));
  }, [client]);

  const setSession = useCallback((token: string, nextUser: AuthUser) => {
    sessionStorage.setItem(tokenKey, token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(tokenKey);
    client.clearStore().catch(() => undefined);
    setUser(null);
  }, [client]);

  const value = useMemo(
    () => ({ user, isLoading, setSession, logout }),
    [user, isLoading, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
