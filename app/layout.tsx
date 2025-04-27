import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Negotiator | Procurement Negotiations Platform',
  description: 'AI-powered procurement negotiation platform that optimizes supplier interactions through intelligent contract management, analytics, and collaboration tools.',
  keywords: 'procurement, ai, negotiation, supplier management, spend analysis, contract management',
  creator: 'AI Negotiator Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-negotiator.example.com',
    title: 'AI Negotiator | Procurement Negotiations Platform',
    description: 'AI-powered procurement negotiation platform that optimizes supplier interactions through intelligent contract management, analytics, and collaboration tools.',
    siteName: 'AI Negotiator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Negotiator | Procurement Negotiations Platform',
    description: 'AI-powered procurement negotiation platform that optimizes supplier interactions through intelligent contract management, analytics, and collaboration tools.',
    creator: '@ai_negotiator',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}