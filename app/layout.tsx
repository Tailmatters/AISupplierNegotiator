import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

// Load the Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Negotiator Platform",
  description: "An AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions",
  generator: "Next.js",
  applicationName: "AI Negotiator",
  keywords: [
    "procurement", 
    "negotiation", 
    "AI", 
    "supplier management", 
    "contract management", 
    "spend analysis"
  ],
  authors: [{ name: "AI Negotiator Team" }],
  creator: "AI Negotiator Team",
  publisher: "AI Negotiator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
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
  );
}