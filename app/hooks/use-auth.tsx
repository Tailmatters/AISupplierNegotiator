"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { User, insertUserSchema } from "@/schema"
import { queryClient, apiRequest } from "@/lib/query-client"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

// Registration schema (extends the insertUserSchema and adds password confirmation)
const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Types
type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>
type UserData = Omit<User, "password">

type AuthContextType = {
  user: UserData | null
  isLoading: boolean
  error: Error | null
  loginMutation: ReturnType<typeof useLoginMutation>
  registerMutation: ReturnType<typeof useRegisterMutation>
  logoutMutation: ReturnType<typeof useLogoutMutation>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null)

// Custom hook for login mutation
function useLoginMutation() {
  const { toast } = useToast()
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Login failed")
      }
      
      return await res.json()
    },
    onSuccess: (data) => {
      // Update user data in the cache
      queryClient.setQueryData(["/api/user"], data.user)
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
        variant: "default",
      })
      
      // Redirect to dashboard
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })
    },
  })
}

// Custom hook for registration mutation
function useRegisterMutation() {
  const { toast } = useToast()
  const router = useRouter()

  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { confirmPassword, ...registrationData } = userData
      
      const res = await apiRequest("POST", "/api/auth/register", registrationData)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Registration failed")
      }
      
      return await res.json()
    },
    onSuccess: (data) => {
      // Update user data in the cache
      queryClient.setQueryData(["/api/user"], data.user)
      
      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.name}!`,
        variant: "default",
      })
      
      // Redirect to dashboard
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      })
    },
  })
}

// Custom hook for logout mutation
function useLogoutMutation() {
  const { toast } = useToast()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout")
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Logout failed")
      }
      
      return await res.json()
    },
    onSuccess: () => {
      // Clear user data from the cache
      queryClient.setQueryData(["/api/user"], null)
      
      // Invalidate all queries to ensure fresh data on login
      queryClient.invalidateQueries()
      
      // Show success message
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
        variant: "default",
      })
      
      // Redirect to auth page
      router.push("/auth")
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      })
    },
  })
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Fetch the current user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        
        if (!res.ok) {
          if (res.status === 401) {
            // Not authenticated, return null instead of throwing
            return null
          }
          
          throw new Error(`Error fetching user: ${res.statusText}`)
        }
        
        return await res.json()
      } catch (error) {
        console.error("Error fetching user:", error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  })

  // Initialize mutations
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const logoutMutation = useLogoutMutation()

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
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

// Custom hook for accessing the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}