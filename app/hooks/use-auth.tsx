'use client'

import { createContext, ReactNode, useContext } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient, apiRequest, getQueryFn } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'

// Types
interface User {
  id: number
  username: string
  name: string | null
  email: string | null
  role: string
}

interface LoginData {
  username: string
  password: string
}

interface RegisterData extends LoginData {
  name?: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: ReturnType<typeof useLoginMutation>
  logoutMutation: ReturnType<typeof useLogoutMutation>
  registerMutation: ReturnType<typeof useRegisterMutation>
}

// Context
export const AuthContext = createContext<AuthContextType | null>(null)

// Mutations
function useLoginMutation() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Login failed')
      }
      
      return res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name || user.username}!`,
        variant: 'success',
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
}

function useLogoutMutation() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout')
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Logout failed')
      }
      
      return res.json()
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logout successful',
        description: 'You have been logged out.',
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
}

function useRegisterMutation() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Registration failed')
      }
      
      return res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Registration successful',
        description: `Welcome, ${user.name || user.username}!`,
        variant: 'success',
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
}

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const registerMutation = useRegisterMutation()
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
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

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}