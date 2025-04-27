'use client'

import * as React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getQueryFn, apiRequest, queryClient } from '@/lib/query-client'
import { useToast } from '@/hooks/use-toast'

// User type
interface User {
  id: number
  username: string
  name?: string
  email?: string
  role: 'admin' | 'buyer' | 'supplier'
}

// Auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: ReturnType<typeof useLoginMutation>
  logoutMutation: ReturnType<typeof useLogoutMutation>
  registerMutation: ReturnType<typeof useRegisterMutation>
}

// Login data type
interface LoginData {
  username: string
  password: string
}

// Register data type
interface RegisterData extends LoginData {
  name?: string
  email?: string
  role?: 'admin' | 'buyer' | 'supplier'
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null)

// Login mutation hook
function useLoginMutation() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Login failed')
      }
      return await res.json()
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
        variant: 'error',
      })
    },
  })
}

// Logout mutation hook
function useLogoutMutation() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Logout failed')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        variant: 'success',
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
}

// Register mutation hook
function useRegisterMutation() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', credentials)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Registration failed')
      }
      return await res.json()
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
        variant: 'error',
      })
    },
  })
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  })

  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const registerMutation = useRegisterMutation()

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
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

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}