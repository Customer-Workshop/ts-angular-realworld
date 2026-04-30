import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../models/user.model';
import * as jwtService from '../services/jwt.service';
import api, { setPurgeAuthCallback } from '../services/api';

export type AuthState = 'authenticated' | 'unauthenticated' | 'unavailable' | 'loading';

interface AuthContextType {
  currentUser: User | null;
  authState: AuthState;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  update: (user: Partial<User>) => Promise<User>;
  getCurrentUser: () => Promise<void>;
  purgeAuth: () => void;
  getCurrentUserSync: () => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface ConduitDebug {
  getToken: () => string | null;
  getAuthState: () => AuthState;
  getCurrentUser: () => User | null;
}

declare global {
  interface Window {
    __conduit_debug__?: ConduitDebug;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigateRef = useRef<ReturnType<typeof useNavigate> | null>(null);

  const NavigateUpdater = useMemo(
    () =>
      function NavigateUpdater() {
        navigateRef.current = useNavigate();
        return null;
      },
    [],
  );

  const cancelRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const purgeAuth = useCallback(() => {
    cancelRetry();
    retryAttemptRef.current = 0;
    jwtService.destroyToken();
    setCurrentUser(null);
    setAuthState('unauthenticated');
  }, [cancelRetry]);

  const setAuth = useCallback(
    (user: User) => {
      cancelRetry();
      retryAttemptRef.current = 0;
      jwtService.saveToken(user.token);
      setCurrentUser(user);
      setAuthState('authenticated');
    },
    [cancelRetry],
  );

  const scheduleRetry = useCallback(() => {
    cancelRetry();
    if (!jwtService.getToken()) return;

    const delaySeconds = Math.min(2 * Math.pow(2, retryAttemptRef.current), 16);
    retryAttemptRef.current++;

    retryTimerRef.current = setTimeout(async () => {
      if (jwtService.getToken()) {
        setAuthState('loading');
        try {
          const response = await api.get<{ user: User }>('/user');
          setAuth(response.data.user);
        } catch (err: unknown) {
          const status = (err as { status?: number }).status ?? 0;
          if (status >= 400 && status < 500) {
            purgeAuth();
          } else {
            setCurrentUser(null);
            setAuthState('unavailable');
            scheduleRetry();
          }
        }
      }
    }, delaySeconds * 1000);
  }, [cancelRetry, setAuth, purgeAuth]);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await api.get<{ user: User }>('/user');
      setAuth(response.data.user);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status ?? 0;
      if (status >= 400 && status < 500) {
        purgeAuth();
      } else {
        setCurrentUser(null);
        setAuthState('unavailable');
        scheduleRetry();
      }
    }
  }, [setAuth, purgeAuth, scheduleRetry]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const response = await api.post<{ user: User }>('/users/login', { user: credentials });
      setAuth(response.data.user);
    },
    [setAuth],
  );

  const register = useCallback(
    async (credentials: { username: string; email: string; password: string }) => {
      const response = await api.post<{ user: User }>('/users', { user: credentials });
      setAuth(response.data.user);
    },
    [setAuth],
  );

  const logout = useCallback(() => {
    purgeAuth();
    navigateRef.current?.('/');
  }, [purgeAuth]);

  const updateUser = useCallback(async (user: Partial<User>): Promise<User> => {
    const response = await api.put<{ user: User }>('/user', { user });
    setCurrentUser(response.data.user);
    return response.data.user;
  }, []);

  const getCurrentUserSync = useCallback((): User | null => {
    return currentUser;
  }, [currentUser]);

  // Setup debug interface and purgeAuth callback
  useEffect(() => {
    setPurgeAuthCallback(purgeAuth);
  }, [purgeAuth]);

  // Setup debug interface
  useEffect(() => {
    window.__conduit_debug__ = {
      getToken: () => jwtService.getToken(),
      getAuthState: () => authState,
      getCurrentUser: () => currentUser,
    };
  }, [authState, currentUser]);

  // Init auth on mount
  useEffect(() => {
    if (jwtService.getToken()) {
      getCurrentUser();
    } else {
      purgeAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRetry();
    };
  }, [cancelRetry]);

  const value = useMemo(
    () => ({
      currentUser,
      authState,
      isAuthenticated: authState === 'authenticated',
      login,
      register,
      logout,
      update: updateUser,
      getCurrentUser,
      purgeAuth,
      getCurrentUserSync,
    }),
    [currentUser, authState, login, register, logout, updateUser, getCurrentUser, purgeAuth, getCurrentUserSync],
  );

  return (
    <AuthContext.Provider value={value}>
      <NavigateUpdater />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
