import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "./providers"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AI Procurement Negotiator",
  description: "AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}