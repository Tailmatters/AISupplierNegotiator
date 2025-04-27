import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { fontSans } from '@/lib/fonts'
import { Providers } from '@/providers'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Negotiator - Optimizing Procurement Through Intelligence',
  description: 'An AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative tools.',
  keywords: [
    'procurement',
    'artificial intelligence',
    'supplier management',
    'contract management',
    'negotiation',
    'spend analysis',
    'procurement analytics',
    'supplier consolidation',
    'procurement software',
    'procurement platform',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`min-h-screen font-sans antialiased bg-background text-foreground ${fontSans.variable}`}
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