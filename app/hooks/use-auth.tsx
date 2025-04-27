'use client'

import { 
  createContext, 
  ReactNode, 
  useContext,
  useCallback,
} from 'react'
import { 
  useQuery, 
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query'
import { getQueryFn, apiRequest, queryClient } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { User, insertUserSchema } from '@/schema'
import { z } from 'zod'

// Define the login data type
type LoginData = {
  username: string
  password: string
}

// Define the register data type using the insertUserSchema
type RegisterData = z.infer<typeof insertUserSchema>

// Auth context type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterData>
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null)

// Provider component for auth context
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // Query to get the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || 'Login failed')
      }
      
      return res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Registration failed' }))
        throw new Error(errorData.error || 'Registration failed')
      }
      
      return res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${user.name}!`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout')
      
      if (!res.ok) {
        throw new Error('Logout failed')
      }
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

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}