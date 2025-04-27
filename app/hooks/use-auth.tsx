'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { User } from '@/schema';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) {
        if (response.status === 401) {
          return null as any; // Not authenticated is a valid state
        }
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Initialize the auth state on component mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  async function login(credentials: LoginCredentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const userData = await response.json();
    queryClient.setQueryData(['auth-user'], userData);
    toast({
      title: 'Login successful',
      description: `Welcome back, ${userData.name}!`,
    });
  }

  async function register(userData: RegisterData) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const newUser = await response.json();
    queryClient.setQueryData(['auth-user'], newUser);
    toast({
      title: 'Registration successful',
      description: `Welcome, ${newUser.name}!`,
    });
  }

  async function logout() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Logout failed');
    }

    queryClient.setQueryData(['auth-user'], null);
    // Invalidate and refetch any queries that depend on auth status
    queryClient.invalidateQueries();

    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading && !isInitialized,
        error: error as Error | null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}