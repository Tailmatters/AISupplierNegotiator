'use client'

import * as React from 'react'
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Base URL for API requests
 */
const API_BASE_URL = '/api'

/**
 * Method type for HTTP requests
 */
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Options for query fetch function
 */
interface QueryFnOptions {
  /**
   * What to do when a 401 is received:
   * - 'throw': throw an error (default)
   * - 'returnNull': return null
   */
  on401?: 'throw' | 'returnNull'
}

/**
 * Create an options object for fetch
 */
function createFetchOptions(
  method: Method = 'GET',
  body?: unknown
): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Important for cookies
  }
}

/**
 * Make an API request
 */
export async function apiRequest(
  method: Method,
  endpoint: string,
  body?: unknown
): Promise<Response> {
  const options = createFetchOptions(method, body)
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      // Get error message from the response body
      let errorMessage = 'Request failed'
      try {
        const data = await response.json()
        errorMessage = data.error || errorMessage
      } catch (e) {
        // Couldn't parse JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      
      const error = new Error(errorMessage)
      error.status = response.status
      throw error
    }

    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

/**
 * Create a query fetch function with options
 */
export function getQueryFn(options: QueryFnOptions = {}) {
  return async <T>({ queryKey }: { queryKey: string[] }): Promise<T> => {
    const [endpoint] = queryKey
    try {
      const response = await apiRequest('GET', endpoint)
      
      if (response.status === 204) {
        return null as unknown as T
      }
      
      return await response.json()
    } catch (error) {
      if (error.status === 401 && options.on401 === 'returnNull') {
        return null as unknown as T
      }
      throw error
    }
  }
}

// Create a client
const QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      queryFn: getQueryFn(),
    },
  },
})

export { QueryClient }

/**
 * Provider component for React Query
 */
export function QueryClientProvider({ children }: React.PropsWithChildren<{}>) {
  const [client] = React.useState(() => QueryClient)
  
  return (
    <TanstackQueryClientProvider client={client}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </TanstackQueryClientProvider>
  )
}