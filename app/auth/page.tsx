"use client";

import * as React from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AuthTabs } from "./components/auth-tabs";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return null; // Return null to prevent flash of content before redirect
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col md:flex-row">
        {/* Auth Form Section */}
        <div className="flex w-full items-center justify-center p-8 md:w-1/2">
          <div className="w-full max-w-md space-y-8">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-primary">
                AI Negotiator
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Sign in to access advanced AI-powered procurement negotiations
              </p>
            </div>
            <AuthTabs />
          </div>
        </div>

        {/* Hero Section */}
        <div className="hidden w-1/2 bg-gradient-to-br from-primary/90 to-primary-foreground p-8 md:flex md:items-center md:justify-center">
          <div className="max-w-md space-y-6 text-white">
            <h2 className="text-3xl font-bold">
              Transform Your Procurement Process
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-4 rounded-full bg-white/20 p-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 11.1755C20 15.6907 16.4183 19.3509 12 19.3509C7.58172 19.3509 4 15.6907 4 11.1755C4 6.66029 7.58172 3 12 3C16.4183 3 20 6.66029 20 11.1755Z"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 10.1755L11 12.1755L15 8.17548"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI-Powered Negotiation</h3>
                  <p className="text-white/80">
                    Let our AI handle supplier negotiations based on your objectives
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 rounded-full bg-white/20 p-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 13.2L8.5 19L21 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Spend Analytics</h3>
                  <p className="text-white/80">
                    Comprehensive analytics for optimizing your procurement spend
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 rounded-full bg-white/20 p-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V5C18 3.89543 17.1046 3 16 3Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 18H12.01"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Smart Contracts</h3>
                  <p className="text-white/80">
                    Automated contract generation and management using templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}