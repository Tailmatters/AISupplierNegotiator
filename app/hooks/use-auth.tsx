"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { User, loginSchema, insertUserSchema } from "@/schema"
import { queryClient, apiRequest } from "@/lib/query-client"
import { useToast } from "@/hooks/use-toast"

// Auth context type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginInput>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterInput>
}

// Define login input type
type LoginInput = {
  email: string
  password: string
}

// Define register input type (based on insertUserSchema)
type RegisterInput = {
  email: string
  password: string
  name: string
  role?: string
  company?: string
  jobTitle?: string
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Query for getting the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await apiRequest("GET", queryKey[0])
        return await response.json()
      } catch (error) {
        if (error.status === 401) {
          return null
        }
        throw error
      }
    },
  })

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginInput>({
    mutationFn: async (credentials) => {
      try {
        // Validate credentials
        loginSchema.parse(credentials)
        
        const response = await apiRequest("POST", "/api/auth/login", credentials)
        return await response.json()
      } catch (error) {
        throw error
      }
    },
    onSuccess: (user) => {
      // Update cache with user data
      queryClient.setQueryData(["/api/user"], user)
      
      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
        variant: "success",
      })
      
      // Redirect to dashboard
      router.push("/dashboard")
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterInput>({
    mutationFn: async (userData) => {
      try {
        // Validate user data
        insertUserSchema.parse(userData)
        
        const response = await apiRequest("POST", "/api/auth/register", userData)
        return await response.json()
      } catch (error) {
        throw error
      }
    },
    onSuccess: (user) => {
      // Update cache with user data
      queryClient.setQueryData(["/api/user"], user)
      
      // Show success toast
      toast({
        title: "Registration successful",
        description: `Welcome to AI Negotiator, ${user.name}!`,
        variant: "success",
      })
      
      // Redirect to dashboard
      router.push("/dashboard")
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
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
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null)
      
      // Show success toast
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      })
      
      // Redirect to login page
      router.push("/auth")
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out",
        variant: "destructive",
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

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}