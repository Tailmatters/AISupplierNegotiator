'use client'

import * as React from 'react'
import { ReactNode, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client
const getQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

/**
 * Helper function to make API requests
 */
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(endpoint, options)

  if (!response.ok) {
    let errorMessage
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`
    }

    throw new Error(errorMessage)
  }

  return response
}

/**
 * Helper function to get query functions
 */
export function getQueryFn({ on401 }: { on401?: 'throw' | 'returnNull' } = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const endpoint = queryKey[0]
      const response = await apiRequest('GET', endpoint)
      
      // If the user is not authenticated, either throw or return null
      if (response.status === 401 && on401 === 'returnNull') {
        return null
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof Error && error.message.includes('401') && on401 === 'returnNull') {
        return null
      }
      throw error
    }
  }
}

export const queryClient = getQueryClient()

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => getQueryClient())

  return (
    <TanstackQueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </TanstackQueryClientProvider>
  )
}