import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'

// Load Inter font with specific subsets
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

// Metadata for the application
export const metadata: Metadata = {
  title: 'Procurement AI Negotiator',
  description: 'AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions through intelligent contract management, advanced analytics, and collaborative tools.',
  keywords: [
    'procurement',
    'supplier negotiation',
    'ai negotiator',
    'contract management',
    'spend analysis',
    'supplier management',
    'business intelligence',
    'procurement analytics',
  ],
  authors: [
    {
      name: 'Procurement AI Platform',
      url: 'https://procurement-ai.vercel.app',
    },
  ],
  creator: 'Procurement AI Platform',
  publisher: 'Procurement AI Platform',
}

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background min-h-screen`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}