'use client';

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest(
  method: HttpMethod,
  url: string,
  data?: unknown,
  options: RequestOptions = {}
) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
    signal: options.signal,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during API request');
  }
}

interface QueryFnOptions {
  on401?: 'throw' | 'returnNull';
}

export function getQueryFn({ on401 = 'throw' }: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const path = queryKey[0];
    const response = await fetch(path, {
      credentials: 'include',
    });

    if (response.status === 401 && on401 === 'returnNull') {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    // For empty responses
    if (response.status === 204) {
      return null;
    }

    return response.json();
  };
}