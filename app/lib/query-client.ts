"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ApiRequestOptions {
  headers?: Record<string, string>;
  body?: any;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options: ApiRequestOptions = {}
) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized/unauthenticated requests
      queryClient.setQueryData(["/api/user"], null);
    }

    // Attempt to parse error response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText };
    }

    throw new Error(
      errorData.error || errorData.message || "An error occurred"
    );
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return response;
  }

  // Otherwise parse JSON
  return response;
}

interface QueryFnOptions {
  on401?: "throw" | "returnNull";
}

export function getQueryFn({ on401 = "throw" }: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    try {
      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 && on401 === "returnNull") {
          return null;
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: response.statusText };
        }

        throw new Error(
          errorData.error || errorData.message || "An error occurred"
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };
}