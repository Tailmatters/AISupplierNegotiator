"use client"

import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}

type FetcherOptions = {
  on401?: "throw" | "returnNull";
};

// This is our default fetcher for queries
export function getQueryFn({ on401 = "throw" }: FetcherOptions = {}) {
  return async function queryFn<T>({ queryKey }: { queryKey: string[] }): Promise<T> {
    const [path] = queryKey;
    
    const response = await fetch(path);
    
    if (response.status === 401) {
      if (on401 === "returnNull") {
        return null as unknown as T;
      } else {
        throw new Error("Unauthorized");
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || response.statusText || "An error occurred";
      throw new Error(errorMessage);
    }
    
    // Return null for 204 No Content responses
    if (response.status === 204) {
      return null as unknown as T;
    }
    
    return response.json();
  };
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  method: Method,
  url: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data && !(data instanceof FormData)) {
    options.body = JSON.stringify(data);
  } else if (data) {
    // FormData handling - remove Content-Type to let the browser set it
    delete options.headers["Content-Type"];
    options.body = data;
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText || "An error occurred";
    throw new Error(errorMessage);
  }

  return response;
}

export function createQueryOptions<TData, TError = Error>(
  queryKey: string[],
  options: Partial<UseQueryOptions<TData, TError>> = {},
  fetcherOptions: FetcherOptions = {}
): UseQueryOptions<TData, TError> {
  return {
    queryKey,
    queryFn: getQueryFn(fetcherOptions) as any,
    ...options,
  };
}

export function createMutationOptions<TData, TVariables, TError = Error, TContext = unknown>(
  options: Partial<UseMutationOptions<TData, TError, TVariables, TContext>> = {}
): UseMutationOptions<TData, TError, TVariables, TContext> {
  return {
    onError: (error: TError) => {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options,
  };
}