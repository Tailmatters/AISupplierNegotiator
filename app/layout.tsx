import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'

// Configure the Inter font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ProcurementAI - AI-powered procurement negotiation platform',
  description: 'Optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative tools.',
  keywords: [
    'AI negotiation',
    'procurement',
    'supplier management',
    'contract management',
    'spend analysis',
    'procurement analytics',
    'supplier collaboration',
    'negotiations',
    'purchasing',
    'procurement software',
  ],
  authors: [{ name: 'ProcurementAI Team' }],
  creator: 'ProcurementAI',
  publisher: 'ProcurementAI',
  viewport: 'width=device-width, initial-scale=1',
  applicationName: 'ProcurementAI',
  formatDetection: {
    telephone: false,
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
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}