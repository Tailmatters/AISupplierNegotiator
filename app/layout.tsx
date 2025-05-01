import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

// Load Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// Metadata for the application
export const metadata: Metadata = {
  title: 'AI Negotiator | Procurement Negotiation Platform',
  description:
    'AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative tools.',
  keywords: [
    'procurement',
    'negotiation',
    'ai',
    'artificial intelligence',
    'supplier management',
    'contract management',
    'spend analysis',
    'procurement analytics',
    'supplier analytics',
    'negotiation strategies',
  ],
  authors: [{ name: 'AI Negotiator Team' }],
  creator: 'AI Negotiator',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <Providers>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}