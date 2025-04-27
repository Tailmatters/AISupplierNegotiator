'use client'

import * as React from 'react'
import { 
  createContext, 
  ReactNode, 
  useContext, 
  useEffect, 
  useState 
} from 'react'
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { apiRequest, queryClient } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { insertUserSchema, User as SelectUser, InsertUser } from '@/schema'
import { z } from 'zod'

// Define the login data type
type LoginData = Pick<InsertUser, 'username' | 'password'>

// Create a more robust registration data schema with validation
const registerSchema = insertUserSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Register data type with confirm password field
type RegisterData = z.infer<typeof registerSchema>

// Define the auth context type
type AuthContextType = {
  user: SelectUser | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  
  // Load user on mount
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user', undefined, {
          skipAuthRedirect: true, // Don't redirect on 401
        })
        if (res.status === 401) return null
        return await res.json()
      } catch (error) {
        return null
      }
    },
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      return await res.json() as SelectUser
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name || user.username}!`,
      })
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...credentials } = data
      const res = await apiRequest('POST', '/api/auth/register', credentials)
      return await res.json() as SelectUser
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${user.name || user.username}!`,
      })
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try a different username or check your input.',
        variant: 'destructive',
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
      router.push('/')
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

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}