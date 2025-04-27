'use client'

import { QueryClient } from '@tanstack/react-query'

type ApiRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type GetQueryFnOptions = {
  on401?: 'throw' | 'returnNull'
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export async function apiRequest(
  method: ApiRequestMethod,
  url: string,
  data?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  return fetch(url, options)
}

export const getQueryFn =
  (options: GetQueryFnOptions = {}) =>
  async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey
    const response = await fetch(url, {
      credentials: 'include',
    })

    if (response.status === 401) {
      if (options.on401 === 'returnNull') {
        return null
      }
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }