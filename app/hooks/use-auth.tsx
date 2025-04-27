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
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiRequest, getQueryFn } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { type User, type InsertUser } from '@/schema'

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

type RegisterData = Omit<InsertUser, 'password'> & { 
  password: string
  passwordConfirm: string 
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Get the current user
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
      const res = await apiRequest('POST', '/api/login', credentials)
      return await res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name || user.username}!`,
        variant: 'success',
      })
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
    mutationFn: async (userData: RegisterData) => {
      // Remove passwordConfirm before sending to API
      const { passwordConfirm, ...registerData } = userData
      
      const res = await apiRequest('POST', '/api/register', registerData)
      return await res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${user.name || user.username}!`,
        variant: 'success',
      })
      router.push('/dashboard')
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
      await apiRequest('POST', '/api/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      })
      router.push('/auth')
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

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}