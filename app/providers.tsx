'use client'

import * as React from 'react'
import { ReactNode } from 'react'

import { QueryClientProvider } from '@/lib/query-client'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Application providers wrapper component
 * Provides context for query client, theme, and auth
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}