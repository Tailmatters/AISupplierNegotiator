import type { Metadata } from 'next'
import './globals.css'
import { inter } from '@/lib/fonts'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AI Negotiator - Procurement Management Platform',
  description: 'AI-powered procurement management platform for negotiating with suppliers',
  keywords: [
    'procurement',
    'ai negotiation',
    'supplier management',
    'contract management',
    'spend analysis',
  ],
  authors: [
    {
      name: 'AI Negotiator Team',
    },
  ],
  creator: 'AI Negotiator',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
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