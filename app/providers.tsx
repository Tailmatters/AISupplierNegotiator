"use client"

import React, { ReactNode } from "react"

// Import providers
import { ReactQueryProvider } from "@/lib/query-client"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"

// Providers props interface
interface ProvidersProps {
  children: ReactNode
}

/**
 * Application providers wrapper component
 * Provides context for query client, theme, and auth
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}