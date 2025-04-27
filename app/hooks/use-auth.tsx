'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query'
import { apiRequest, queryClient } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/schema'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterData>
}

type LoginData = {
  username: string
  password: string
}

type RegisterData = {
  username: string
  email: string
  password: string
  name: string
  role?: 'admin' | 'buyer' | 'supplier'
  company?: string
  position?: string
  phone?: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [authInitialized, setAuthInitialized] = useState(false)
  
  // Fetch the current user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    enabled: authInitialized,
    refetchOnWindowFocus: false,
    retry: false,
  })
  
  // Initialize authentication state
  useEffect(() => {
    setAuthInitialized(true)
  }, [])
  
  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      return await res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.name || data.username}!`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      })
    },
  })
  
  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData)
      return await res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${data.name || data.username}!`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      })
    },
  })
  
  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      })
    },
    onError: (error) => {
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      })
    },
  })
  
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}