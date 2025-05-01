import { 
  QueryClient, 
  QueryClientProvider,
  QueryFunction,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, ReactNode } from "react"

// Type for API request options
interface ApiRequestInit extends RequestInit {
  params?: Record<string, string>
}

// Type for API response with JSON data
type ApiResponse<T = any> = Response & {
  json(): Promise<T>
}

// Error types for handling API errors
export class ApiError extends Error {
  status: number
  data?: any

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.status = status
    this.data = data
    this.name = "ApiError"
  }

  static async from(response: Response): Promise<ApiError> {
    let data
    try {
      data = await response.json()
    } catch (error) {
      data = null
    }

    return new ApiError(
      response.status,
      data?.error || response.statusText || "Unknown error",
      data
    )
  }
}

// API request function with type checking
export const apiRequest = async <T = any>(
  method: string,
  url: string,
  data?: any,
  options: ApiRequestInit = {}
): Promise<ApiResponse<T>> => {
  const { params, ...init } = options
  
  // Build the URL with query parameters if provided
  let finalUrl = url
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value)
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      finalUrl += `${url.includes("?") ? "&" : "?"}${queryString}`
    }
  }

  // Construct the fetch options
  const fetchOptions: RequestInit = {
    method,
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  }

  // Add body for methods that accept it
  if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(data)
  }

  // Make the request
  const response = await fetch(finalUrl, fetchOptions)

  // Handle error responses
  if (!response.ok) {
    throw await ApiError.from(response)
  }

  return response as ApiResponse<T>
}

// Type for Query Function options
interface QueryFnOptions {
  on401?: "returnNull" | "throw"
}

// Query function for React Query
export const getQueryFn = (options: QueryFnOptions = {}) => {
  const queryFn = async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const [url, ...params] = queryKey
      const response = await apiRequest("GET", url, null, {
        params: params.length > 0 ? params[0] : undefined,
      })
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && options.on401 === "returnNull") {
        return null
      }
      throw error
    }
  }

  return queryFn
}

// Create QueryClient with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: false,
      queryFn: getQueryFn(),
    },
  },
})

// React Query Provider component
export function QueryClientProviderWrapper({
  children,
}: {
  children: ReactNode
}) {
  const [client] = useState(() => queryClient)

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  )
}