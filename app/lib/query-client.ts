'use client'

import { QueryClient } from '@tanstack/react-query'

export type ApiRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type FetchOptions = {
  on401?: 'throw' | 'returnNull'
  headers?: Record<string, string>
}

// Create a new QueryClient instance to be used across the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Helper function to make API requests
 * @param method The HTTP method to use
 * @param url The URL to make the request to
 * @param data The data to send with the request
 * @param customHeaders Additional headers to include with the request
 * @returns The fetch response
 */
export async function apiRequest(
  method: ApiRequestMethod,
  url: string,
  data?: any,
  customHeaders?: Record<string, string>
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  return fetch(url, options)
}

/**
 * Helper function to get a query function for TanStack Query
 * @param options Options for the query function
 * @returns A query function that can be used with useQuery
 */
export function getQueryFn<T = any>(options?: FetchOptions) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T> => {
    const [endpoint] = queryKey
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: options?.headers,
      })

      if (!response.ok) {
        if (response.status === 401 && options?.on401 === 'returnNull') {
          return null as T
        }
        
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }))
        
        throw new Error(
          errorData.message || errorData.error || 'An error occurred'
        )
      }

      // For empty responses like 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return response.json()
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }
}