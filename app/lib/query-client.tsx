'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'

// Error response types
type ErrorResponse = {
  message: string
  error?: string
  statusCode?: number
}

// Configuration for API requests
interface RequestConfig extends RequestInit {
  /** Set to true to avoid redirecting to login page on 401 */
  skipAuthRedirect?: boolean
}

// HTTP request methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Default fetch options
const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Handles API request errors uniformly
 */
async function handleApiError(response: Response): Promise<ErrorResponse> {
  // Try to parse response as JSON
  try {
    const data = await response.json()
    return {
      message: data.message || `Error: ${response.status} ${response.statusText}`,
      error: data.error,
      statusCode: response.status,
    }
  } catch (e) {
    // If response can't be parsed as JSON
    return {
      message: `Error: ${response.status} ${response.statusText}`,
      statusCode: response.status,
    }
  }
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest<T = any>(
  method: HttpMethod,
  url: string,
  body?: any,
  config: RequestConfig = {}
): Promise<Response> {
  const options: RequestInit = {
    ...defaultFetchOptions,
    ...config,
    method,
  }

  // Add body if present
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  // Handle non-success responses
  if (!response.ok) {
    const errorData = await handleApiError(response)
    
    // Handle unauthorized errors
    if (response.status === 401 && !config.skipAuthRedirect) {
      // Redirect to login when unauthorized
      window.location.href = '/auth'
    }

    throw new Error(errorData.message)
  }

  return response
}

/**
 * React Query fetcher function that works with our API structure
 */
export function getQueryFn<T>(options: { on401?: 'redirect' | 'returnNull' } = {}) {
  return async ({ queryKey }: { queryKey: (string | number | object)[] }): Promise<T | undefined> => {
    const url = queryKey[0] as string
    
    try {
      const response = await apiRequest('GET', url, undefined, {
        skipAuthRedirect: options.on401 === 'returnNull',
      })
      
      // Return null when the response is 204 No Content
      if (response.status === 204) {
        return undefined
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof Error && options.on401 === 'returnNull') {
        return undefined
      }
      throw error
    }
  }
}

// Export a singleton QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      queryFn: getQueryFn(),
    },
  },
})

export function QueryClientWrapper({ children }: { children: ReactNode }) {
  // Create new client for each session to avoid hydration issues
  const [client] = useState(() => queryClient)

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  )
}