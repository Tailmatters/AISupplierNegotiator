"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, logoutMutation } = useAuth();

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // This should not happen due to middleware redirecting, but just in case
  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="font-bold">AI Negotiator Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Welcome, {user.name}
            </div>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container py-4 md:py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Dashboard card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>View your personalized dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get a comprehensive overview of your procurement activities, supplier performance and KPIs.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Dashboard</Button>
              </CardFooter>
            </Card>

            {/* Negotiations card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Negotiations</CardTitle>
                <CardDescription>Manage your active negotiations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor ongoing negotiations, start new ones, and review negotiation history with AI assistance.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Negotiations</Button>
              </CardFooter>
            </Card>

            {/* Suppliers card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
                <CardDescription>Manage your supplier database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add new suppliers, view performance metrics, and manage supplier relationships.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Suppliers</Button>
              </CardFooter>
            </Card>

            {/* Contracts card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>Manage your contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create, review, and manage contract templates and active contracts with suppliers.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Contracts</Button>
              </CardFooter>
            </Card>

            {/* Spend Analysis card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Spend Analysis</CardTitle>
                <CardDescription>Analyze your procurement spend</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload and analyze spend data to identify savings opportunities and optimization areas.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Spend Analysis</Button>
              </CardFooter>
            </Card>

            {/* Market Analysis card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>Explore market insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get Porter's Five Forces analysis and market intelligence for your procurement categories.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Market Analysis</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted py-4">
        <div className="container flex flex-col gap-2 md:flex-row md:gap-4">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} AI Negotiator Pro. All rights reserved.
          </p>
          <div className="md:ml-auto flex justify-center gap-4 md:justify-end">
            <Button variant="link" size="sm" className="text-muted-foreground">
              Terms
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              Privacy
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}