'use client';

import { QueryClient } from '@tanstack/react-query';

type FetcherOptions = {
  on401?: 'redirect' | 'returnNull' | 'throw';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export const getQueryFn =
  (options?: FetcherOptions) =>
  async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    const [path] = queryKey;
    
    try {
      const response = await fetch(path, {
        credentials: 'include',
      });

      if (response.status === 401) {
        if (options?.on401 === 'returnNull') {
          return null;
        } else if (options?.on401 === 'redirect' && typeof window !== 'undefined') {
          window.location.href = '/auth';
          return null;
        } else {
          throw new Error('Not authenticated');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw new Error(error.message || 'An error occurred');
      }

      return response.json();
    } catch (error: any) {
      console.error('Query error:', error);
      throw error;
    }
  };

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `${response.status} ${response.statusText}`,
    }));
    throw new Error(error.message || 'An error occurred');
  }

  return response;
}