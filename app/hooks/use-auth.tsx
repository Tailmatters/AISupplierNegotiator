'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react'
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query'
import { User, type InsertUser } from '@/schema'
import { apiRequest } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  registerMutation: UseMutationResult<User, Error, InsertUser>
  logoutMutation: UseMutationResult<void, Error, void>
}

type LoginData = {
  username: string
  password: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for getting the current authenticated user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user')
        if (!res.ok) {
          if (res.status === 401) return null
          throw new Error('Failed to fetch user')
        }
        return await res.json()
      } catch (err) {
        console.error('Error fetching user:', err)
        return null
      }
    },
  })

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Login failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data)
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      })
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
  const registerMutation = useMutation<User, Error, InsertUser>({
    mutationFn: async (userData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Registration failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data)
      toast({
        title: 'Registration successful',
        description: 'Your account has been created!',
      })
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
      const res = await apiRequest('POST', '/api/auth/logout')
      if (!res.ok) {
        throw new Error('Logout failed')
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null)
      queryClient.invalidateQueries()
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
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
        registerMutation,
        logoutMutation,
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