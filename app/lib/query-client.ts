'use client'

import { QueryClient, QueryFunctionContext } from '@tanstack/react-query'

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

type ApiRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Helper function to make API requests
 */
export async function apiRequest(
  method: ApiRequestMethod,
  url: string,
  data?: unknown,
  customHeaders?: Record<string, string>
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  }

  if (data !== undefined) {
    config.body = JSON.stringify(data)
  }

  return fetch(url, config)
}

interface GetQueryFnOptions {
  /**
   * What to do when a 401 status is returned
   * - 'throw': Throw an error (default)
   * - 'returnNull': Return null
   */
  on401?: 'throw' | 'returnNull'
}

/**
 * Creates a query function for TanStack Query
 */
export function getQueryFn<TData = unknown, TError = Error>({
  on401 = 'throw',
}: GetQueryFnOptions = {}) {
  return async function queryFn({
    queryKey: [url],
  }: QueryFunctionContext<[string], TData>): Promise<TData> {
    if (typeof url !== 'string') {
      throw new Error('Invalid query key. Expected a string URL as the first element.')
    }

    const response = await apiRequest('GET', url)

    if (response.status === 401) {
      if (on401 === 'returnNull') {
        return null as TData
      } else {
        throw new Error('Unauthorized')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.error || `API request failed with status ${response.status}`
      throw new Error(message)
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    return response.text() as unknown as TData
  }
}