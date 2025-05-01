import { QueryClient, DefaultOptions } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import {
  QueryClientProvider as TanStackQueryClientProvider,
} from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";

// Create a client for the server
export const serverQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// JSON fetch helper for API calls
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: unknown
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || response.statusText || "Request failed";
    
    throw new Error(errorMessage);
  }
  
  return response;
}

// Type for the request options
export type QueryFetcherOptions = {
  on401?: "throw" | "returnNull";
};

// Default fetcher function for useQuery hooks
export function getQueryFn(options: QueryFetcherOptions = {}) {
  const { on401 = "throw" } = options;
  
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    const url = queryKey[0];
    
    try {
      const response = await apiRequest("GET", url);
      
      if (!response.bodyUsed) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      if (
        on401 === "returnNull" &&
        error instanceof Error &&
        error.message.includes("Unauthorized")
      ) {
        return null;
      }
      
      throw error;
    }
  };
}

// Common query client configuration
const defaultOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
};

// Client-side QueryClientProvider with error handling
export function QueryClientProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions,
        queryCache: {
          onError: (error) => {
            console.error(`Query error:`, error);
            if (error instanceof Error) {
              toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
              });
            }
          },
        },
      })
  );

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}

// Export the queryClient for use in mutations, invalidations, etc.
export const queryClient = serverQueryClient;