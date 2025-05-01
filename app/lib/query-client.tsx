"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

/**
 * Custom API request function that handles common request configurations
 * @param method HTTP method (GET, POST, PUT, DELETE, etc)
 * @param url API endpoint URL
 * @param body Optional request body for POST/PUT requests
 * @returns Response object from fetch
 */
export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  // Handle unauthorized responses
  if (response.status === 401) {
    throw new Error("Authentication required")
  }

  // Handle other error responses
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `Error ${response.status}: ${response.statusText}`)
  }

  return response
}

/**
 * Default query function for React Query
 * @param options Configuration options for the query
 * @returns Function to perform the API request
 */
export function getQueryFn({ on401 = "throw" }: { on401?: "throw" | "returnNull" } = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const [url] = queryKey
      const response = await apiRequest("GET", url)
      return await response.json()
    } catch (error: any) {
      if (error.message === "Authentication required" && on401 === "returnNull") {
        return null
      }
      throw error
    }
  }
}

/**
 * Creates a query client with default configuration
 * @returns Configured QueryClient instance
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        queryFn: getQueryFn(),
      },
    },
  })
}

// Export singleton instance for imperative usages
export const queryClient = createQueryClient()

/**
 * React Query provider component
 * Provides the query client to the application
 */
export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [client] = React.useState(() => createQueryClient())

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}