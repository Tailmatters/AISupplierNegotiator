"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import AuthTabs from "./components/auth-tabs"

export default function AuthPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Auth Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              AI Negotiator
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your intelligent procurement assistant
            </p>
          </div>
          
          <AuthTabs />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary">
          <div className="flex flex-col justify-center h-full max-w-2xl mx-auto px-8 text-white">
            <h2 className="text-4xl font-bold mb-6">
              Revolutionize Your Procurement Process
            </h2>
            <p className="text-xl mb-8">
              Our AI negotiation system automates supplier negotiations, helps generate contracts, and provides
              comprehensive spend analysis to drive cost savings.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Advanced AI-powered negotiations based on your objectives</p>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Contract generation and management from templates</p>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Detailed spend analysis and supplier consolidation insights</p>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Customizable dashboard for personalized analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}