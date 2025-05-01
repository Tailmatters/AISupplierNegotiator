import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers";

// Import the Inter font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Procurement Negotiator",
  description: "AI-powered procurement negotiation platform that empowers businesses to optimize supplier interactions through intelligent contract management.",
  keywords: [
    "procurement",
    "AI negotiation",
    "supplier management",
    "contract management",
    "spend analysis",
    "market analysis",
  ],
  authors: [
    {
      name: "AI Negotiator Team",
    },
  ],
  creator: "AI Negotiator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AI Procurement Negotiator",
    description: "AI-powered procurement negotiation platform",
    siteName: "AI Negotiator",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}