"use client";

import React, { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
} from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Fetch API wrapper with improved error handling
type ApiRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  headers?: Record<string, string>;
  on401?: "error" | "returnNull"; // Whether to throw an error or return null on 401
  retry?: boolean;
}

// Standard API request function
export async function apiRequest(
  method: ApiRequestMethod,
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { headers = {}, on401 = "error" } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Important for cookies
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle API error responses
    if (!response.ok) {
      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        if (on401 === "returnNull") {
          return new Response(JSON.stringify(null), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Attempt to parse the error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: response.statusText };
      }

      const errorMessage = errorData.error || errorData.message || "Request failed";
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // If it's already an Error instance, rethrow it
      throw error;
    } else {
      // Otherwise, create a new Error
      throw new Error("Network error occurred");
    }
  }
}

// Default query function that uses our apiRequest
export const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  if (!Array.isArray(queryKey) || queryKey.length === 0) {
    throw new Error("Invalid query key");
  }

  const [url, ...params] = queryKey;
  
  if (typeof url !== "string") {
    throw new Error("First element of queryKey must be a string URL");
  }

  // For GET requests with query parameters
  let fullUrl = url;
  if (params.length > 0 && typeof params[0] === "object") {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params[0])) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    }
    const queryString = queryParams.toString();
    if (queryString) {
      fullUrl += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const response = await apiRequest("GET", fullUrl, undefined, {
    on401: "returnNull",
  });
  
  return response.json();
};

// Function to get query with options
export const getQueryFn = 
  (options: ApiRequestOptions = {}) => 
  async ({ queryKey }: { queryKey: string[] }) => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) {
      throw new Error("Invalid query key");
    }

    const [url] = queryKey;
    const response = await apiRequest("GET", url, undefined, options);
    return response.json();
  };

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 404s or other client errors
        if (error instanceof Error) {
          if (error.message.includes("404") || error.message.includes("401")) {
            return false;
          }
        }
        return failureCount < 3;
      },
      queryFn: defaultQueryFn,
    },
    mutations: {
      onError: (error) => {
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      },
    },
  },
});

// Provider component
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}