'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * Theme provider component that wraps next-themes
 * This allows for toggling between light, dark, and system themes
 * @param props Theme provider props including attribute, defaultTheme, enableSystem
 * @returns Theme provider component
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}