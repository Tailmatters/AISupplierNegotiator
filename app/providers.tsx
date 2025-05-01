"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@/lib/query-client";
import { AuthProvider } from "@/hooks/use-auth";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper component
 * Provides context for query client, theme, and auth
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}