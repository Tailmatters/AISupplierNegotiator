"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * Dashboard page / Home page for the procurement platform
 */
export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show nothing (redirecting)
  if (!user) {
    return null;
  }

  // Show dashboard for authenticated user
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold gradient-heading">AI Procurement Negotiator</h1>
        <p className="text-muted-foreground">Your intelligent procurement assistant</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick actions card */}
        <div className="col-span-1 row-span-1 bg-card rounded-lg shadow p-6 hover-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2">
            <li className="p-2 hover:bg-muted rounded-md transition-colors">
              <a href="/negotiations/new" className="flex items-center gap-2">
                <span className="bg-primary/10 p-2 rounded-full text-primary">+</span>
                <span>Start New Negotiation</span>
              </a>
            </li>
            <li className="p-2 hover:bg-muted rounded-md transition-colors">
              <a href="/suppliers" className="flex items-center gap-2">
                <span className="bg-primary/10 p-2 rounded-full text-primary">👥</span>
                <span>Manage Suppliers</span>
              </a>
            </li>
            <li className="p-2 hover:bg-muted rounded-md transition-colors">
              <a href="/spend-analysis" className="flex items-center gap-2">
                <span className="bg-primary/10 p-2 rounded-full text-primary">📊</span>
                <span>Upload Spend Data</span>
              </a>
            </li>
            <li className="p-2 hover:bg-muted rounded-md transition-colors">
              <a href="/contracts" className="flex items-center gap-2">
                <span className="bg-primary/10 p-2 rounded-full text-primary">📄</span>
                <span>View Contracts</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Active negotiations card */}
        <div className="col-span-2 row-span-1 bg-card rounded-lg shadow p-6 hover-card">
          <h2 className="text-xl font-semibold mb-4">Active Negotiations</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <div className="flex justify-between">
                <h3 className="font-medium">Office Supplies Contract</h3>
                <span className="badge badge-primary">In Progress</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Negotiating with OfficeMax for Q2 office supplies
              </p>
              <div className="flex justify-between mt-2">
                <span className="text-sm">Started 3 days ago</span>
                <a href="/negotiations/1" className="text-sm text-primary hover:underline">
                  View Details
                </a>
              </div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between">
                <h3 className="font-medium">IT Hardware Renewal</h3>
                <span className="badge badge-warning">Pending Response</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Waiting for TechSupplies Inc. to respond to latest proposal
              </p>
              <div className="flex justify-between mt-2">
                <span className="text-sm">Started 1 week ago</span>
                <a href="/negotiations/2" className="text-sm text-primary hover:underline">
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Spend analysis summary */}
        <div className="col-span-1 md:col-span-3 bg-card rounded-lg shadow p-6 hover-card">
          <h2 className="text-xl font-semibold mb-4">Spend Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-muted/40 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-primary">$1.2M</div>
              <div className="text-sm text-muted-foreground">Total Annual Spend</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-primary">42</div>
              <div className="text-sm text-muted-foreground">Active Suppliers</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-primary">12%</div>
              <div className="text-sm text-muted-foreground">Savings Opportunity</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
          <div className="mt-4 text-right">
            <a href="/spend-analysis" className="text-sm text-primary hover:underline">
              View Detailed Analysis
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}