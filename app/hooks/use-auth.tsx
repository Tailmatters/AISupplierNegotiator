"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query"
import { User, loginSchema, insertUserSchema } from "@/schema"
import { apiRequest, queryClient } from "@/lib/query-client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { z } from "zod"

// Types
export type LoginCredentials = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof insertUserSchema>

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginCredentials>
  registerMutation: UseMutationResult<User, Error, RegisterData>
  logoutMutation: UseMutationResult<void, Error, void>
  userQuery: UseQueryResult<User | null, Error>
}

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  // Get user query
  const userQuery = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    retry: 0,
  })

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials)
      return response.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user)
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
      router.push("/")
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/auth/register", data)
      return response.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user)
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}!`,
      })
      router.push("/")
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout")
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null)
      queryClient.invalidateQueries()
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
      router.push("/auth")
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Set initialized after first user query completes
  useEffect(() => {
    if (!userQuery.isLoading) {
      setIsInitialized(true)
    }
  }, [userQuery.isLoading])

  // Memoize context value
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: userQuery.data || null,
      isLoading: !isInitialized || userQuery.isLoading,
      error: userQuery.error || null,
      loginMutation,
      registerMutation,
      logoutMutation,
      userQuery,
    }),
    [
      isInitialized,
      userQuery.data,
      userQuery.error,
      userQuery.isLoading,
      loginMutation,
      registerMutation,
      logoutMutation,
      userQuery,
    ]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}