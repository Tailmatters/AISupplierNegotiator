"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { SpendByCategory } from "./spend-by-category"
import { SavingsOpportunities } from "./savings-opportunities"
import { SupplierPerformance } from "./supplier-performance"
import { NegotiationActivity } from "./negotiation-activity"
import { getQueryFn } from "@/lib/query-client"

interface DashboardProps {
  userId: number
}

export function ProcurementDashboard({ userId }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: getQueryFn(),
  })

  const { data: negotiations, isLoading: negotiationsLoading } = useQuery({
    queryKey: ["/api/negotiations"],
    queryFn: getQueryFn(),
  })

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: getQueryFn(),
  })

  const { data: spendByCategory, isLoading: spendByCategoryLoading } = useQuery({
    queryKey: ["/api/spend/by-category"],
    queryFn: getQueryFn(),
  })

  const { data: spendBySupplier, isLoading: spendBySupplierLoading } = useQuery({
    queryKey: ["/api/spend/by-supplier"],
    queryFn: getQueryFn(),
  })

  const isLoading = 
    statsLoading || 
    negotiationsLoading || 
    suppliersLoading || 
    spendByCategoryLoading || 
    spendBySupplierLoading

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Loading dashboard data...</span>
      </div>
    )
  }

  const activeSavings = stats?.totalSavings || 0
  const pendingNegotiations = negotiations?.filter(n => n.status === "active").length || 0
  const upcomingRenewals = suppliers?.filter(s => {
    const contractEndDate = s.contractEndDate ? new Date(s.contractEndDate) : null
    if (!contractEndDate) return false
    const today = new Date()
    const inThirtyDays = new Date()
    inThirtyDays.setDate(today.getDate() + 30)
    return contractEndDate >= today && contractEndDate <= inThirtyDays
  }).length || 0
  const atRiskSpend = stats?.atRiskSpend || 0

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Procurement Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your spending, savings, and negotiation activities in one place.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Savings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(activeSavings)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatPercentage(0.12)} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Negotiations
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingNegotiations}</div>
            <p className="text-xs text-muted-foreground">
              {pendingNegotiations > 0 ? 'Requires attention' : 'No action needed'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Renewals
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRenewals}</div>
            <p className="text-xs text-muted-foreground">
              Due in the next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              At-Risk Spend
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(atRiskSpend)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(atRiskSpend / (stats?.totalSpend || 1))} of total spend
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spend">Spend Analysis</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>
                  Distribution of spend across procurement categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SpendByCategory data={spendByCategory || []} />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Savings Opportunities</CardTitle>
                <CardDescription>
                  Identified savings opportunities by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SavingsOpportunities />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>
                  Performance metrics for top suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierPerformance />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Negotiation Activity</CardTitle>
                <CardDescription>
                  Recent negotiation activities and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NegotiationActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="spend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Spend Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of organizational spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Implement detailed spend analysis components */}
              <p>Detailed spend analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Track and manage supplier relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Implement supplier management components */}
              <p>Supplier management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="negotiations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Negotiations</CardTitle>
              <CardDescription>
                Track and manage ongoing supplier negotiations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Implement negotiations components */}
              <p>Negotiations tracking features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}