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
import { type User, type InsertUser } from "@/schema"
import { getQueryFn, apiRequest, queryClient } from "@/lib/query-client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<User, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<User, Error, RegisterData>
}

type LoginData = {
  email: string
  password: string
}

type RegisterData = InsertUser & {
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  })

  // Initialize authentication state after first load
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      setIsInitialized(true)
    }
  }, [isLoading, isInitialized])

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials)
      return await res.json()
    },
    onSuccess: (user: User) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.username}!`,
      })
      queryClient.setQueryData(["/api/user"], user)
      router.push("/")
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Validate password match
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match")
      }
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...credentials } = data
      
      const res = await apiRequest("POST", "/api/auth/register", credentials)
      return await res.json()
    },
    onSuccess: (user: User) => {
      toast({
        title: "Registration successful",
        description: `Account created for ${user.name || user.username}`,
      })
      queryClient.setQueryData(["/api/user"], user)
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
        title: "Logged out successfully",
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
        user: user || null,
        isLoading: isLoading && !isInitialized,
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

export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth")
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}