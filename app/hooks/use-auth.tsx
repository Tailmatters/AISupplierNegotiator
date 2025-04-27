"use client"

import { createContext, ReactNode, useContext } from "react"
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query"
import { User } from "@/schema"
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  name: string
  email: string
  password: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterData>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials)
      return await res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user)
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
      router.push("/")
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data)
      return await res.json()
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user)
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}!`,
      })
      router.push("/")
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout")
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/auth")
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}