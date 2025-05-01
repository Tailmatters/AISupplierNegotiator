"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// Constants for API requests
const API_BASE_URL = "/api"
const DEFAULT_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000 // 10 minutes

/**
 * Options for API requests
 */
interface ApiRequestOptions extends RequestInit {
  skipContentType?: boolean
}

/**
 * Options for query function
 */
interface QueryFnOptions {
  on401?: "throw" | "returnNull"
}

/**
 * Handles API errors and returns relevant error message
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = "An unexpected error occurred"

  try {
    const contentType = response.headers.get("content-type")
    
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } else {
      const text = await response.text()
      errorMessage = text || `Request failed with status ${response.status}`
    }
  } catch (error) {
    errorMessage = `Request failed with status ${response.status}`
  }

  const error = new Error(errorMessage)
  throw error
}

/**
 * Makes an API request with proper error handling
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
  
  const headers: HeadersInit = {}
  
  if (!options.skipContentType) {
    headers["Content-Type"] = "application/json"
  }

  const config: RequestInit = {
    method,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: "include",
    ...options,
  }

  if (data !== undefined && method !== "GET") {
    config.body = options.skipContentType ? data : JSON.stringify(data)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    await handleApiError(response)
  }

  return response
}

/**
 * Creates a query function for TanStack Query
 */
export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint, ...params] = queryKey
    
    try {
      const queryParams = params.length > 0 ? `?${new URLSearchParams(params[0] as any)}` : ""
      const url = `${endpoint}${queryParams}`
      
      const response = await apiRequest("GET", url)
      
      return await response.json()
    } catch (error: any) {
      if (error.message === "Unauthorized" && options.on401 === "returnNull") {
        return null
      }
      
      throw error
    }
  }
}

/**
 * Create a new QueryClient with default options
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_CACHE_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
        queryFn: getQueryFn(),
      },
    },
  })
}

// Export a singleton QueryClient instance
export const queryClient = createQueryClient()

/**
 * Provider component for TanStack Query
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}