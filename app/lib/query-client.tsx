"use client";

import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
} from "@tanstack/react-query";

/**
 * Creates a query client with default options
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Create a query client instance
export const queryClient = createQueryClient();

/**
 * Query Provider component that wraps the application
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => createQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Options for API requests
 */
interface ApiRequestOptions {
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Makes an API request to the backend with proper error handling
 * @param method HTTP method
 * @param url API endpoint URL
 * @param data Request body data (for POST, PUT, PATCH)
 * @param options Additional request options
 * @returns Response object
 * @throws Error with message from the API or generic error message
 */
export async function apiRequest(
  method: Method,
  url: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // Include cookies for authentication
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    // Try to get error message from response body
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Request failed"
      );
    } catch (e) {
      // If we can't parse the response, use status text
      if (e instanceof Error && e.message !== "Request failed") {
        throw e;
      }
      throw new Error(
        response.statusText || `Request failed with status ${response.status}`
      );
    }
  }

  return response;
}

/**
 * Options for the query function generator
 */
interface QueryFnOptions {
  on401?: "throw" | "returnNull";
}

/**
 * Creates a query function for TanStack React Query that handles API requests
 * @param options Options for handling specific cases (e.g., 401 errors)
 * @returns A query function for react-query
 */
export function getQueryFn(options: QueryFnOptions = {}): QueryFunction {
  const { on401 = "throw" } = options;

  return async ({ queryKey }: { queryKey: string[] }) => {
    const url = queryKey[0];

    try {
      const response = await apiRequest("GET", url);
      
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("401") &&
        on401 === "returnNull"
      ) {
        return null;
      }
      throw error;
    }
  };
}