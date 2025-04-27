import { QueryClient } from '@tanstack/react-query'

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Custom fetch options for API requests
interface FetchOptions {
  on401?: 'returnNull' | 'throw'
}

// Generic fetch function for the API
export function getQueryFn({ on401 = 'throw' }: FetchOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint] = queryKey
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    if (response.status === 401) {
      if (on401 === 'returnNull') {
        return null
      }
      throw new Error('Unauthorized')
    }
    
    if (!response.ok) {
      throw new Error('An error occurred while fetching the data.')
    }
    
    return response.json()
  }
}

// Function to make API requests
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: unknown
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
  
  try {
    const response = await fetch(endpoint, options)
    return response
  } catch (error) {
    console.error(`API request error (${method} ${endpoint}):`, error)
    throw error
  }
}