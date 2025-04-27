'use client'

import React, { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Function to create a query client
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Global shared queryClient instance
export const queryClient = createQueryClient()

// API request options
type APIRequestOptions = {
  on401?: 'throwError' | 'returnNull'
  customHeaders?: Record<string, string>
}

/**
 * Generic API request function for use with TanStack Query
 */
export async function apiRequest<T = any>(
  method: string, 
  url: string, 
  body?: any, 
  options: APIRequestOptions = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.customHeaders,
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })

    // Handle unauthorized
    if (response.status === 401 && options.on401 === 'returnNull') {
      return response
    }

    // Handle unsuccessful responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || response.statusText || 'An error occurred'
      throw new Error(errorMessage)
    }

    return response
  } catch (error) {
    console.error(`API ${method} request failed:`, error)
    throw error
  }
}

/**
 * Helper function to generate a query function for TanStack Query
 */
export function getQueryFn<T = any>(options: APIRequestOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    const [url] = queryKey
    
    try {
      const response = await apiRequest<T>('GET', url, undefined, options)
      
      if (response.status === 401 && options.on401 === 'returnNull') {
        return undefined
      }
      
      return await response.json()
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }
}

/**
 * React Query Client Provider
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}