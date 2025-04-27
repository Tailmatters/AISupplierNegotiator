"use client"

import { QueryClient } from "@tanstack/react-query"
import { useState } from "react"

type FetcherOptions = {
  on401?: "throw" | "returnNull"
}

export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any,
  customHeaders: HeadersInit = {}
) {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  }

  const options: RequestInit = { method, headers }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(endpoint, options)
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`API error ${response.status}: ${errorText}`)
  }

  return response
}

export function getQueryFn(options: FetcherOptions = {}) {
  return async function queryFn({ queryKey }: { queryKey: string[] }) {
    const [endpoint] = queryKey
    const response = await fetch(endpoint)

    if (response.status === 401 && options.on401 === "returnNull") {
      return null
    }

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${await response.text()}`)
    }

    return response.json()
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
})

export function useQueryClient() {
  const [client] = useState(() => new QueryClient())
  return client
}