'use client'

import * as React from 'react'
import { useState, useEffect, type ReactNode } from 'react'

import { QueryClientProvider } from '@/lib/query-client'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Handle mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return simplified version on server to prevent hydration mismatch
  if (!mounted) {
    return (
      <QueryClientProvider>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </QueryClientProvider>
    )
  }

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