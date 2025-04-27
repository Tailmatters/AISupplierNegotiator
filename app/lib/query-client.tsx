'use client'

import * as React from 'react'
import { ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
  QueryFunction,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Base API URL
const API_BASE_URL = ''

/**
 * Options for API requests
 */
interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>
}

/**
 * Make an API request with the specified method
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`
  
  if (options.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, value]) => {
      searchParams.append(key, value)
    })
    url = `${url}?${searchParams.toString()}`
  }
  
  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies
    ...options,
  }
  
  // Add request body for methods that support it
  if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(data)
  }
  
  // Make the request
  const response = await fetch(url, fetchOptions)
  
  // Handle API errors
  if (!response.ok && response.status !== 401) {
    try {
      const errorData = await response.json()
      throw new Error(errorData.error || `API Error: ${response.status}`)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`API Error: ${response.status}`)
    }
  }
  
  return response
}

// Default query function that uses our API request function
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  if (!Array.isArray(queryKey) || queryKey.length === 0 || typeof queryKey[0] !== 'string') {
    throw new Error('Invalid query key')
  }
  
  const endpoint = queryKey[0]
  const response = await apiRequest('GET', endpoint)
  
  if (!response.ok) {
    if (response.status === 401) {
      return null
    }
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// QueryClientProvider component
export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [client] = React.useState(() => queryClient)
  
  return (
    <TanstackQueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </TanstackQueryClientProvider>
  )
}