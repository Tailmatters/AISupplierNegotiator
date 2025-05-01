'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query'
import { User as SelectUser, type InsertUser } from '@/schema'
import { getQueryFn, apiRequest } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'

// Type definitions
export type AuthContextType = {
  user: SelectUser | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>
}

export type LoginData = Pick<InsertUser, 'username' | 'password'>

// Create Authentication Context
export const AuthContext = React.createContext<AuthContextType | null>(null)

// Authentication Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()

  // Fetch the current user's data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ['/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<SelectUser> => {
      const res = await apiRequest('POST', '/auth/login', credentials)
      return await res.json()
    },
    onSuccess: (userData: SelectUser) => {
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name || userData.username}!`,
        variant: 'default',
      })
      refetch()
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser): Promise<SelectUser> => {
      const res = await apiRequest('POST', '/auth/register', userData)
      return await res.json()
    },
    onSuccess: (userData: SelectUser) => {
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.name || userData.username}!`,
        variant: 'default',
      })
      refetch()
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await apiRequest('POST', '/auth/logout')
    },
    onSuccess: () => {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
        variant: 'default',
      })
      refetch()
      router.push('/auth')
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message || 'Error logging out',
        variant: 'destructive',
      })
    },
  })

  // Provide the auth context to children
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

// Custom hook to access Authentication Context
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}