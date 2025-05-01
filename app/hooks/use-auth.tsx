import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { User, loginSchema, insertUserSchema } from "@/schema";
import { apiRequest, getQueryFn, queryClient } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  registerMutation: UseMutationResult<User, Error, RegisterCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  name: string;
  company?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(null);

  // Get current user data
  const {
    data: user,
    error,
    isLoading,
    isSuccess,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1,
  });

  const isAuthenticated = !!user;

  // Monitor auth state changes
  useEffect(() => {
    if (previousAuthState === null) {
      setPreviousAuthState(isAuthenticated);
      return;
    }

    // If auth state changes from not authenticated to authenticated
    if (!previousAuthState && isAuthenticated) {
      toast({
        id: "login-success",
        title: "Welcome back",
        description: user?.name ? `Welcome back, ${user.name}!` : "You're now logged in",
        variant: "default",
      });
      
      // Only redirect to dashboard if we're on the auth page
      if (window.location.pathname === "/auth") {
        router.push("/");
      }
    }

    setPreviousAuthState(isAuthenticated);
  }, [isAuthenticated, previousAuthState, router, toast, user?.name]);

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest(
        "POST",
        "/api/auth/login",
        loginSchema.parse(credentials)
      );
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterCredentials>({
    mutationFn: async (userData: RegisterCredentials) => {
      const res = await apiRequest(
        "POST",
        "/api/auth/register",
        insertUserSchema.parse(userData)
      );
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
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
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
      router.push("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
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

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}