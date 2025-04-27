"use client"

import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
})

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

// Custom API request function for mutations
export async function apiRequest(
  method: Method,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }

  if (data && method !== "GET") {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }))
    throw new Error(error.message || "Something went wrong")
  }

  return response
}

// Custom query function for useQuery that handles 401s and redirects
export const getQueryFn = <T>(options?: { on401?: "redirect" | "returnNull" }) => {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T> => {
    const [url] = queryKey
    const response = await fetch(url, {
      credentials: "include",
    })

    if (response.status === 401) {
      if (options?.on401 === "redirect") {
        window.location.href = "/auth"
        // This will never be reached because of the redirect
        return new Promise(() => {})
      }
      if (options?.on401 === "returnNull") {
        return null as T
      }
      throw new Error("Unauthorized")
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(error.message || "Something went wrong")
    }

    const data = await response.json()
    return data
  }
}