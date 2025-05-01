'use client'

import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { QueryClientProvider as TanstackQueryProvider } from '@tanstack/react-query'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

type ApiRequestOptions = {
  skipAuthRedirect?: boolean
  headers?: Record<string, string>
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Make an API request with proper error handling and authentication support
 */
export async function apiRequest(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const url = endpoint.startsWith('/') 
    ? `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`
    : endpoint
  
  const { skipAuthRedirect = false, headers = {} } = options
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Always include cookies for auth
  }
  
  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    requestOptions.body = JSON.stringify(data)
  }
  
  try {
    const response = await fetch(url, requestOptions)
    
    // Handle auth errors (redirect to login)
    if (response.status === 401 && !skipAuthRedirect) {
      window.location.href = '/auth'
      throw new Error('Authentication required')
    }
    
    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || errorData.error || `Request failed with status ${response.status}`
      )
    }
    
    return response
  } catch (error) {
    console.error(`API request failed: ${method} ${url}`, error)
    throw error
  }
}

/**
 * Generate a QueryFn for TanStack Query with proper typing
 */
export function getQueryFn<T>(options: ApiRequestOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T> => {
    const [endpoint] = queryKey
    const response = await apiRequest('GET', endpoint, undefined, options)
    return await response.json()
  }
}

/**
 * React Query Provider with Dev Tools enabled in development
 */
export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient)
  
  return (
    <TanstackQueryProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </TanstackQueryProvider>
  )
}