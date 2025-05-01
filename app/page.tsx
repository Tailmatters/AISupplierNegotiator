"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Activity,
  FileText,
  Users,
  PieChart,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * Dashboard page / Home page for the procurement platform
 */
export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold gradient-heading">AI Negotiator</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center px-4 py-3 text-primary font-medium bg-primary/5 rounded-md">
            <Activity className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/negotiations" className="flex items-center px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md">
            <MessageSquare className="mr-3 h-5 w-5" />
            Negotiations
          </Link>
          <Link href="/suppliers" className="flex items-center px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md">
            <Users className="mr-3 h-5 w-5" />
            Suppliers
          </Link>
          <Link href="/contracts" className="flex items-center px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md">
            <FileText className="mr-3 h-5 w-5" />
            Contracts
          </Link>
          <Link href="/spend-analysis" className="flex items-center px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md">
            <BarChart className="mr-3 h-5 w-5" />
            Spend Analysis
          </Link>
          <Link href="/market-analysis" className="flex items-center px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md">
            <PieChart className="mr-3 h-5 w-5" />
            Market Analysis
          </Link>
          <div className="pt-4 mt-4 border-t">
            <Link href="/settings" className="flex items-center px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log Out
            </button>
          </div>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "UN"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.company || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden w-full bg-background border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold gradient-heading">AI Negotiator</h1>
        <Button variant="outline" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Button>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "User"}! Here's an overview of your procurement activities.
            </p>
          </div>
          <div className="action-buttons">
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Negotiation
            </Button>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card className="p-6 hover-card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Active Negotiations</h3>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">4</p>
              <span className="badge badge-success">+2 new</span>
            </div>
          </Card>
          
          <Card className="p-6 hover-card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Suppliers</h3>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">26</p>
              <span className="badge badge-primary">+3 this month</span>
            </div>
          </Card>
          
          <Card className="p-6 hover-card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Contracts</h3>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">15</p>
              <span className="badge badge-warning">2 expiring</span>
            </div>
          </Card>
          
          <Card className="p-6 hover-card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Savings</h3>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">$42.5k</p>
              <span className="badge badge-success">+12% YoY</span>
            </div>
          </Card>
        </div>

        {/* Recent negotiations */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Negotiations</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Last Update</th>
                  <th>Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Supplier A Inc.</td>
                  <td>Office Supplies</td>
                  <td><span className="badge badge-primary">Active</span></td>
                  <td>Today</td>
                  <td className="text-green-500">+8.5%</td>
                </tr>
                <tr>
                  <td className="font-medium">Tech Hardware Ltd</td>
                  <td>IT Equipment</td>
                  <td><span className="badge badge-success">Completed</span></td>
                  <td>Yesterday</td>
                  <td className="text-green-500">+12.3%</td>
                </tr>
                <tr>
                  <td className="font-medium">Logistics Partners</td>
                  <td>Shipping</td>
                  <td><span className="badge badge-warning">Waiting</span></td>
                  <td>3 days ago</td>
                  <td className="text-gray-500">Pending</td>
                </tr>
                <tr>
                  <td className="font-medium">Global Manufacturing</td>
                  <td>Raw Materials</td>
                  <td><span className="badge badge-success">Completed</span></td>
                  <td>1 week ago</td>
                  <td className="text-green-500">+15.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}