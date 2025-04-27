import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'AI Negotiator - Procurement Negotiation Platform',
  description: 'An AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative tools.',
  keywords: [
    'procurement',
    'ai negotiation',
    'supplier management',
    'contract management',
    'spend analysis',
    'business intelligence',
    'procurement analytics',
    'supplier negotiations',
    'vendor management',
    'supply chain optimization',
  ],
  authors: [
    {
      name: 'AI Negotiator Team',
    },
  ],
  creator: 'AI Negotiator',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}