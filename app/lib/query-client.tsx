'use client'

import * as React from 'react'
import { ReactNode, useState } from 'react'
import { 
  QueryClient, 
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query'

// Custom fetch function for API requests
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

// Function to make API requests
export async function apiRequest(
  method: ApiRequestOptions['method'] = 'GET',
  path: string,
  data?: any,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : path
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  }

  if (data !== undefined) {
    requestOptions.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, requestOptions)
    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Type for the options used in getQueryFn
interface GetQueryFnOptions {
  on401?: 'throw' | 'returnNull'
}

// Function to create query fetchers
export function getQueryFn(options: GetQueryFnOptions = {}) {
  const { on401 = 'throw' } = options
  
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    const [path] = queryKey
    
    try {
      const response = await apiRequest('GET', path)
      
      if (response.status === 401 && on401 === 'returnNull') {
        return null
      }
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || `Error ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      throw error
    }
  }
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      queryFn: getQueryFn(),
    },
  },
})

// QueryClientProvider component
export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient)
  return (
    <TanstackQueryClientProvider client={client}>
      {children}
    </TanstackQueryClientProvider>
  )
}