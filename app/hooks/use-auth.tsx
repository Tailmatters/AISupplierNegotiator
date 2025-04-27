'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  useQuery,
  useMutation,
  QueryClient,
  UseMutationResult,
} from '@tanstack/react-query'
import { InsertUser, User } from '@/schema'
import { apiRequest, queryClient } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Types
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

type RegisterData = Omit<InsertUser, 'role'> & {
  role?: 'buyer' | 'supplier' | 'admin'
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  
  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    retry: 0,
  })

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      return await res.json()
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name}!`,
      })
      router.push('/dashboard')
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData) => {
      const res = await apiRequest('POST', '/api/auth/register', {
        ...userData,
        role: userData.role || 'buyer',
      })
      return await res.json()
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userData.name}!`,
      })
      router.push('/dashboard')
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
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
      queryClient.invalidateQueries()
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
      router.push('/')
    },
    onError: (error) => {
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
        user,
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

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}