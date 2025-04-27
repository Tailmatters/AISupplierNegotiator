'use client'

import { 
  QueryClient, 
  keepPreviousData, 
  QueryClientProvider as TanstackQueryClientProvider
} from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

// Configuration for fetch requests
interface FetchOptions extends RequestInit {
  on401?: 'throw' | 'returnNull'
}

// Generic query function to handle API requests
export const getQueryFn = <T>(options: FetchOptions = {}) => {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    const [url, ...rest] = queryKey
    const response = await apiRequest('GET', url, null, options)
    
    if (response.status === 401 && options.on401 === 'returnNull') {
      return undefined
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return await response.json()
  }
}

// API request helper
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options: FetchOptions = {}
): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  const body = data ? JSON.stringify(data) : undefined
  
  const response = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include',
    ...options,
  })
  
  return response
}

// Initialize the React Query client
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        placeholderData: keepPreviousData,
      },
    },
  })
}

// Provider component for TanStack Query
export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  )
}

// Create a shared client for direct use
export const queryClient = createQueryClient()