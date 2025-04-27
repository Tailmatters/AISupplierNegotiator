'use client'

import { QueryClient } from '@tanstack/react-query'

type ApiErrorResponse = {
  error: string
}

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: unknown
}

type QueryFnOptions = {
  on401?: 'throw' | 'returnNull'
  signal?: AbortSignal
}

export class ApiError extends Error {
  status: number
  data: ApiErrorResponse | null

  constructor(message: string, status: number, data: ApiErrorResponse | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Make an API request with proper error handling
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: unknown,
  init?: RequestInit
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    ...init,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(endpoint, options)

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null
    try {
      errorData = await response.json()
    } catch (e) {
      // Response wasn't JSON, continue with default error message
    }

    const message = errorData?.error || `API request failed with status ${response.status}`
    throw new ApiError(message, response.status, errorData)
  }

  return response
}

/**
 * Create a query function for TanStack Query
 */
export function getQueryFn<T>({ on401 = 'throw', signal }: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    const [endpoint] = queryKey
    
    try {
      const response = await apiRequest('GET', endpoint, undefined, { signal })
      
      if (response.status === 204) {
        return undefined
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && on401 === 'returnNull') {
        return undefined
      }
      throw error
    }
  }
}

/**
 * Optimistic update helper for mutations
 */
export function optimisticUpdate<T>(
  queryKey: string | string[],
  updateFn: (oldData: T) => T
) {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey]
  
  return {
    onMutate: async (newData: unknown) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previousData = queryClient.getQueryData<T>(key)
      
      if (previousData) {
        queryClient.setQueryData<T>(key, (oldData) => {
          if (!oldData) return previousData
          return updateFn(oldData)
        })
      }
      
      return { previousData }
    },
    onError: (_err: unknown, _newData: unknown, context: { previousData?: T }) => {
      if (context?.previousData) {
        queryClient.setQueryData(key, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
    },
  }
}