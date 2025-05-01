import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'

import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

import './globals.css'

// Define font with subsets
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

// Metadata for the application
export const metadata: Metadata = {
  title: 'AI Procurement Negotiator',
  description: 'AI-powered procurement negotiation platform for optimizing supplier interactions',
  keywords: [
    'procurement',
    'negotiation',
    'AI',
    'supplier management',
    'contract management',
    'spend analysis',
  ],
  authors: [
    {
      name: 'Procurement AI Team',
    },
  ],
}

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}