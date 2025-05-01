"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

import { User, loginSchema, insertUserSchema } from "@/schema";
import { apiRequest, getQueryFn } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

// Types for login and register data
type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: string;
  company?: string;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Query to get the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });
  
  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (data) => {
      try {
        // Validate data using zod schema
        loginSchema.parse(data);
        
        // Send login request
        const response = await apiRequest("POST", "/api/auth/login", data);
        return response;
      } catch (err: any) {
        if (err.errors) {
          // This is a zod validation error
          throw new Error("Invalid login data: " + JSON.stringify(err.errors));
        }
        throw err;
      }
    },
    onSuccess: (userData) => {
      // Update the user query with the new user data
      queryClient.setQueryData(["/api/user"], userData);
      
      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      // Redirect to dashboard
      router.push("/");
    },
    onError: (err) => {
      // Show error toast
      toast({
        title: "Login failed",
        description: err.message || "Could not log in. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (data) => {
      try {
        // Validate data using zod schema
        insertUserSchema.parse(data);
        
        // Send register request
        const response = await apiRequest("POST", "/api/auth/register", data);
        return response;
      } catch (err: any) {
        if (err.errors) {
          // This is a zod validation error
          throw new Error("Invalid registration data: " + JSON.stringify(err.errors));
        }
        throw err;
      }
    },
    onSuccess: (userData) => {
      // Update the user query with the new user data
      queryClient.setQueryData(["/api/user"], userData);
      
      // Show success toast
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.name}!`,
      });
      
      // Redirect to dashboard
      router.push("/");
    },
    onError: (err) => {
      // Show error toast
      toast({
        title: "Registration failed",
        description: err.message || "Could not register. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Clear user data from query cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Show success toast
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to login page
      router.push("/auth");
    },
    onError: (err) => {
      // Show error toast
      toast({
        title: "Logout failed",
        description: err.message || "Could not log out. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}