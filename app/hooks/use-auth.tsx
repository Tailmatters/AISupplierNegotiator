'use client'

import * as React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient, getQueryFn, apiRequest } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Define the user type (simplified)
type User = {
  id: number
  username: string
  name: string
  email: string
  role: 'admin' | 'buyer' | 'supplier'
}

// Login credentials type
type LoginCredentials = {
  username: string
  password: string
}

// Registration data type
type RegisterData = {
  username: string
  name: string
  email: string
  password: string
  role?: 'admin' | 'buyer' | 'supplier'
}

// Auth context type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: ReturnType<typeof useLoginMutation>
  registerMutation: ReturnType<typeof useRegisterMutation>
  logoutMutation: ReturnType<typeof useLogoutMutation>
}

// Create the auth context
const AuthContext = React.createContext<AuthContextType | null>(null)

// Custom hook for login mutation
function useLoginMutation() {
  const toast = useToast()
  const router = useRouter()
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Login failed')
      }
      
      return res.json() as Promise<User>
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user)
      toast.toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
        variant: 'success',
      })
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Custom hook for registration mutation
function useRegisterMutation() {
  const toast = useToast()
  const router = useRouter()
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', data)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Registration failed')
      }
      
      return res.json() as Promise<User>
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user)
      toast.toast({
        title: 'Registration successful',
        description: `Welcome, ${user.name}!`,
        variant: 'success',
      })
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Custom hook for logout mutation
function useLogoutMutation() {
  const toast = useToast()
  const router = useRouter()
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout')
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Logout failed')
      }
      
      return res.json()
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast.toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
      router.push('/')
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const logoutMutation = useLogoutMutation()
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  })
  
  const value = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = React.useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}