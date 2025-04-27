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
  useQueryClient 
} from '@tanstack/react-query'
import { apiRequest } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'
import { User, InsertUser } from '@/schema'

// Types for the auth context
type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterData>
}

// Types for the login data
type LoginData = {
  username: string
  password: string
}

// Types for registration data
type RegisterData = Pick<InsertUser, 'username' | 'password' | 'name' | 'email' | 'role'> & {
  confirmPassword: string
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  
  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Query to fetch the current user
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/user')
        
        if (response.status === 401) {
          return null
        }
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error ${response.status}: ${response.statusText}`)
        }
        
        return response.json()
      } catch (error) {
        if ((error as Error).message.includes('401')) {
          return null
        }
        throw error
      }
    },
    enabled: isMounted,
    retry: false,
    refetchOnWindowFocus: false,
  })

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Logged in successfully',
        description: 'Welcome back!',
      })
      refetch() // Refetch the user data
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
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest('POST', '/api/auth/register', userData)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Registered successfully',
        description: 'Your account has been created.',
      })
      refetch() // Refetch the user data
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please check your information and try again.',
        variant: 'destructive',
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout')
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`)
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
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

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}