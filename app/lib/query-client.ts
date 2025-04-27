"use client"

import { 
  QueryClient, 
  QueryClientProvider as TanStackQueryClientProvider 
} from "@tanstack/react-query"
import React from "react"

export type ApiRequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

type ApiRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface QueryFnOptions {
  on401?: "throwError" | "redirect" | "returnNull"
  redirectTo?: string
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export const QueryClientProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  )
}

export class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = "ApiError"
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, window.location.origin)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

export async function apiRequest(
  method: ApiRequestMethod,
  path: string,
  data?: any,
  options: ApiRequestOptions = {}
) {
  const { params, ...init } = options
  const url = buildUrl(path, params)
  
  const headers = new Headers(init.headers)
  
  if (data && !(data instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  
  const response = await fetch(url, {
    method,
    body: data instanceof FormData ? data : JSON.stringify(data),
    credentials: "same-origin",
    ...init,
    headers,
  })
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch (e) {
      // If we can't parse the error as JSON, we'll use the default error message
    }
    
    throw new ApiError(errorMessage, response.status)
  }
  
  return response
}

export function getQueryFn<T>({ on401 = "throwError", redirectTo = "/auth" }: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    const path = queryKey[0]
    
    try {
      const response = await apiRequest("GET", path)
      
      if (response.status === 204) {
        return undefined
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        if (on401 === "redirect") {
          window.location.href = redirectTo
          return undefined
        } else if (on401 === "returnNull") {
          return undefined
        }
      }
      
      throw error
    }
  }
}