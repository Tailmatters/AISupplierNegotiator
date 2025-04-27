"use client"

import { 
  QueryClient, 
  QueryClientConfig,
  QueryFunction 
} from "@tanstack/react-query"

// API request options
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
type ApiRequestOptions = {
  headers?: Record<string, string>
  on401?: "throw" | "returnNull"
}

// Default API request function
export async function apiRequest(
  method: Method,
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok && response.status === 401 && options.on401 === "returnNull") {
    return null as any
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || errorData.message || response.statusText
    throw new Error(errorMessage)
  }

  return response
}

// Function to get a query function with appropriate error handling
export function getQueryFn<TData = unknown>(
  options: ApiRequestOptions = {}
): QueryFunction<TData> {
  return async ({ queryKey }) => {
    const [url] = queryKey as [string]
    const response = await apiRequest("GET", url, undefined, options)
    
    // Return null for 401 if specified
    if (response === null && options.on401 === "returnNull") {
      return null as any
    }
    
    return await response.json()
  }
}

// Create a QueryClient with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  } as QueryClientConfig["defaultOptions"],
})