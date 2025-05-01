"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider, QueryKey } from "@tanstack/react-query";
// Uncomment if you need dev tools
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface ApiRequestInit extends RequestInit {
  parseJson?: boolean;
}

type ApiRequestError = Error & {
  status?: number;
  headers?: Headers;
};

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  options: ApiRequestInit = {}
) {
  const { parseJson = true, ...init } = options;
  const headers = init.headers || {};

  const req: RequestInit = {
    method,
    ...init,
    headers: {
      ...("Content-Type" in headers
        ? {}
        : {
            "Content-Type": "application/json",
          }),
      ...headers,
    },
  };

  if (body !== undefined) {
    req.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(url, req);

  if (!response.ok) {
    const error: ApiRequestError = new Error(
      `API request failed with status ${response.status}`
    );
    error.status = response.status;
    error.headers = response.headers;

    try {
      const errorData = await response.json();
      Object.assign(error, { data: errorData });

      error.message =
        errorData.message ||
        errorData.error ||
        `API request failed with status ${response.status}`;
    } catch (e) {
      // If response is not JSON, just use the status text
      error.message = response.statusText;
    }

    throw error;
  }

  // Return the response directly if parseJson is false
  if (!parseJson) {
    return response;
  }

  // For 204 No Content, don't try to parse JSON
  if (response.status === 204) {
    return {};
  }

  try {
    return await response.json();
  } catch (error) {
    if (response.headers.get("Content-Length") === "0") {
      return {};
    }
    throw error;
  }
}

export const defaultQueryFn = async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
  const [url, params] = queryKey;
  
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params as Record<string, string>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  try {
    const data = await apiRequest("GET", fullUrl);
    return data;
  } catch (error) {
    throw error;
  }
};

export function getQueryFn({ on401 = "throw" }: { on401?: "throw" | "returnNull" } = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    try {
      return await defaultQueryFn({ queryKey });
    } catch (error: any) {
      if (error.status === 401 && on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      queryFn: defaultQueryFn,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Uncomment if you need dev tools */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}