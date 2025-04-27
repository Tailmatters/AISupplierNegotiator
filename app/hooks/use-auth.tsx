'use client'

import { createContext, ReactNode, useContext } from 'react'
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query'
import { apiRequest, queryClient, getQueryFn } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/schema'

type LoginData = {
  username: string
  password: string
}

type RegisterData = {
  username: string
  name: string
  email: string
  password: string
  role?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterData>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // Fetch the current user
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
        const errorData = await res.json()
        throw new Error(errorData.error || 'Login failed')
      }
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
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error || 
          (errorData.details && errorData.details.length > 0 
            ? errorData.details[0].message 
            : 'Registration failed')
        )
      }
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
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout')
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Logout failed')
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        variant: 'info',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'error',
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