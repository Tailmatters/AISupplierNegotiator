"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// HTTP Method types
type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// Options for fetch function with on401 behavior
type FetchOptions = RequestInit & {
  on401?: "throw" | "returnNull"
}

/**
 * Create a query client with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

/**
 * Make an API request with proper error handling
 * @param method HTTP method
 * @param url API endpoint URL
 * @param data Request body (will be JSON.stringified)
 * @param options Additional fetch options
 * @returns Response object
 */
export async function apiRequest(
  method: HTTPMethod,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  }
  
  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // Important for cookies
    ...options,
  }
  
  if (data && method !== "GET") {
    config.body = JSON.stringify(data)
  }
  
  return fetch(url, config)
}

/**
 * Create a fetch function for TanStack Query
 * @param options Fetch options with 401 behavior
 * @returns Query function
 */
export function getQueryFn(options?: FetchOptions) {
  return async function fetchData<T>({ queryKey }: { queryKey: string[] }): Promise<T | null> {
    const [url] = queryKey
    
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        ...options,
      })
      
      // Handle 401 Unauthorized based on options
      if (res.status === 401) {
        if (options?.on401 === "returnNull") {
          return null
        }
        throw new Error("Unauthorized")
      }
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`)
      }
      
      return res.json()
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      throw error
    }
  }
}

/**
 * React Query client provider component
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}