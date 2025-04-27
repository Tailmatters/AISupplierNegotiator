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
import { apiRequest, queryClient, getQueryFn } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { User, InsertUser } from '@/schema'

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

type RegisterData = InsertUser & {
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [initialized, setInitialized] = useState(false)

  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: initialized,
  })

  // Initialize client auth state from server
  useEffect(() => {
    setInitialized(true)
  }, [])

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      return await res.json()
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(['/api/user'], userData)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name || userData.username}!`,
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      })
    },
  })

  // Registration mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', data)
      return await res.json()
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(['/api/user'], userData)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.name || userData.username}!`,
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Could not create account',
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
        description: 'You have been successfully logged out.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
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