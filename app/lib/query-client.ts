'use client'

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

export type FetcherOptions = {
  on401?: 'redirect' | 'throw' | 'returnNull'
  customHeaders?: Record<string, string>
}

// Default fetcher for React Query
export const getQueryFn = (options: FetcherOptions = {}) => {
  return async function queryFn<T>({ queryKey }: { queryKey: string[] }): Promise<T> {
    const [endpoint] = queryKey
    const res = await apiRequest('GET', endpoint, undefined, options)
    
    if (res.status === 401) {
      if (options.on401 === 'redirect') {
        window.location.href = '/auth'
        return new Promise(() => {}) as Promise<T> // Never resolves
      } else if (options.on401 === 'returnNull') {
        return null as unknown as T
      } else {
        throw new Error('Unauthorized')
      }
    }
    
    if (!res.ok) {
      const error = await res.text().catch(() => 'Unknown error')
      throw new Error(error)
    }
    
    return res.json() as Promise<T>
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function apiRequest(
  method: Method,
  endpoint: string,
  data?: any,
  options: FetcherOptions = {}
) {
  const url = endpoint.startsWith('http') ? endpoint : endpoint
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.customHeaders,
  }
  
  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Important for cookies
  }
  
  return fetch(url, config)
}