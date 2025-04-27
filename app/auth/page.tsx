'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import AuthTabs from './components/auth-tabs';

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user && !isLoading) {
      redirect('/dashboard');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-form-container">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">AI Negotiator</h1>
            <p className="text-muted-foreground">
              Advanced procurement negotiation platform
            </p>
          </div>

          <AuthTabs />
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our 
              <a href="#" className="font-medium text-primary hover:underline ml-1">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <div className="auth-hero">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Transform Your Procurement Negotiations
          </h2>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Our AI-powered platform streamlines supplier interactions through
            advanced contract management, analytics, and intelligent negotiation tools.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Smart Negotiations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI-powered negotiation strategies based on historical data
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Contract Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Intelligent contract generation and management
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Spend Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Comprehensive spend analysis and optimization
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Market Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Porter's Five Forces analysis for categories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}