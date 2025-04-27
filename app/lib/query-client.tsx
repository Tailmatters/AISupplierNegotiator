'use client'

import React, { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Config options for query fetcher
type QueryFetcherConfig = {
  on401?: 'throw' | 'returnNull' | 'redirect'
  redirectTo?: string
}

// Base API request function
export async function apiRequest(
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(path, options)

  // Handle unauthenticated requests
  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  // Handle general API errors
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API error: ${response.status}`)
  }

  return response
}

// Query fetcher with config options
export function getQueryFn<T = any>(config: QueryFetcherConfig = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    const [path] = queryKey
    
    try {
      const response = await apiRequest('GET', path)
      
      // Empty response with 204 status
      if (response.status === 204) {
        return undefined
      }
      
      return await response.json()
    } catch (error) {
      if (error.message === 'Unauthorized') {
        if (config.on401 === 'redirect' && config.redirectTo) {
          if (typeof window !== 'undefined') {
            window.location.href = config.redirectTo
          }
          return undefined
        }
        
        if (config.on401 === 'returnNull') {
          return undefined
        }
      }
      
      throw error
    }
  }
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient)
  
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}