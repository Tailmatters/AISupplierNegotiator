import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Negotiator - AI-Powered Procurement Negotiation Platform',
  description: 'Optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative negotiation tools.',
  keywords: 'procurement, negotiation, AI, supplier management, spend analysis, contract management',
  authors: [{ name: 'AI Negotiator Team' }],
  creator: 'AI Negotiator',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-negotiator.com',
    title: 'AI Negotiator - AI-Powered Procurement Negotiation Platform',
    description: 'Optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative negotiation tools.',
    siteName: 'AI Negotiator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Negotiator - AI-Powered Procurement Negotiation Platform',
    description: 'Optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative negotiation tools.',
    creator: '@AINegotiator',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}