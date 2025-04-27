'use client'

import { 
  QueryClient, 
  QueryFunction, 
  QueryFunctionContext, 
  QueryKey
} from '@tanstack/react-query'

// Default function to fetch data from the API
async function defaultQueryFn<T = unknown>({
  queryKey,
}: QueryFunctionContext): Promise<T> {
  if (!queryKey || !queryKey[0] || typeof queryKey[0] !== 'string') {
    throw new Error('Invalid query key')
  }

  const endpoint = queryKey[0]
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = new Error('API Error')
    try {
      const errorData = await response.json()
      Object.assign(error, errorData)
    } catch {
      // Fall back to status text if json parsing fails
      ;(error as any).message = response.statusText
    }
    
    throw error
  }

  // Return empty result for 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// Create query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
})

// Function to make API requests for mutations
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  return fetch(endpoint, options)
}

type QueryFnOptions = {
  on401?: 'throw' | 'returnNull'
}

// Create custom query function with options
export function getQueryFn({
  on401 = 'throw',
}: QueryFnOptions = {}): QueryFunction<any, QueryKey> {
  return async (context: QueryFunctionContext) => {
    try {
      return await defaultQueryFn(context)
    } catch (error: any) {
      // Handle unauthorized errors
      if (error.status === 401 && on401 === 'returnNull') {
        return null
      }
      throw error
    }
  }
}