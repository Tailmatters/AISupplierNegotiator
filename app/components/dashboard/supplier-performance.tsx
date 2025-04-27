"use client"

import React, { useState } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Star, 
  TrendingDown, 
  TrendingUp, 
  Users 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercentage } from "@/lib/utils"

// For demonstration purposes - in production this would come from the API
const demoSupplierData = [
  {
    id: 1,
    name: "Acme Corp",
    annualSpend: 420000,
    onTimeDelivery: 0.94,
    qualityScore: 4.2,
    responseTime: 0.9,
    priceCompetitiveness: 0.76,
    innovationScore: 0.82,
    riskScore: 0.2,
    trend: "up",
    category: "IT Services",
    savings: 42000,
    savingsPercent: 0.1,
    issues: 2
  },
  {
    id: 2,
    name: "Global Logistics",
    annualSpend: 310000,
    onTimeDelivery: 0.88,
    qualityScore: 3.9,
    responseTime: 0.85,
    priceCompetitiveness: 0.8,
    innovationScore: 0.65,
    riskScore: 0.3,
    trend: "stable",
    category: "Logistics",
    savings: 15500,
    savingsPercent: 0.05,
    issues: 4
  },
  {
    id: 3,
    name: "Apex Marketing",
    annualSpend: 195000,
    onTimeDelivery: 0.97,
    qualityScore: 4.5,
    responseTime: 0.95,
    priceCompetitiveness: 0.7,
    innovationScore: 0.9,
    riskScore: 0.15,
    trend: "up",
    category: "Marketing",
    savings: 21450,
    savingsPercent: 0.11,
    issues: 1
  },
  {
    id: 4,
    name: "Metro Consulting",
    annualSpend: 275000,
    onTimeDelivery: 0.91,
    qualityScore: 4.0,
    responseTime: 0.82,
    priceCompetitiveness: 0.75,
    innovationScore: 0.78,
    riskScore: 0.25,
    trend: "down",
    category: "Professional Services",
    savings: 0,
    savingsPercent: 0,
    issues: 5
  },
  {
    id: 5,
    name: "Office Solutions",
    annualSpend: 85000,
    onTimeDelivery: 0.99,
    qualityScore: 4.3,
    responseTime: 0.88,
    priceCompetitiveness: 0.9,
    innovationScore: 0.6,
    riskScore: 0.1,
    trend: "stable",
    category: "Office Supplies",
    savings: 8500,
    savingsPercent: 0.1,
    issues: 0
  }
]

// Performance metrics for radar chart
const getPerformanceMetrics = (supplier: any) => [
  {
    subject: 'Delivery',
    A: supplier.onTimeDelivery * 100,
    fullMark: 100
  },
  {
    subject: 'Quality',
    A: (supplier.qualityScore / 5) * 100,
    fullMark: 100
  },
  {
    subject: 'Response',
    A: supplier.responseTime * 100,
    fullMark: 100
  },
  {
    subject: 'Price',
    A: supplier.priceCompetitiveness * 100,
    fullMark: 100
  },
  {
    subject: 'Innovation',
    A: supplier.innovationScore * 100,
    fullMark: 100
  }
]

// Risk level indicator
const getRiskLevel = (score: number) => {
  if (score <= 0.2) return { label: "Low", color: "bg-green-100 text-green-800" }
  if (score <= 0.5) return { label: "Medium", color: "bg-amber-100 text-amber-800" }
  return { label: "High", color: "bg-red-100 text-red-800" }
}

// Trend indicator
const getTrendIndicator = (trend: string) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-rose-500" />
  return <Clock className="h-4 w-4 text-amber-500" />
}

// Supplier rating stars
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

export function SupplierPerformance() {
  const [selectedSupplier, setSelectedSupplier] = useState(demoSupplierData[0])
  const [viewType, setViewType] = useState<"list" | "chart">("list")
  
  // Format data for bar chart
  const spendData = demoSupplierData.map(supplier => ({
    name: supplier.name,
    spend: supplier.annualSpend,
    savings: supplier.savings
  }))

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-background border shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Annual Spend: {formatCurrency(payload[0].value)}</p>
          {payload[1] && (
            <p className="text-sm text-emerald-600">Savings: {formatCurrency(payload[1].value)}</p>
          )}
        </Card>
      )
    }
    return null
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Top 5 suppliers by annual spend
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewType === "list" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewType("list")}
          >
            List
          </Button>
          <Button 
            variant={viewType === "chart" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewType("chart")}
          >
            Chart
          </Button>
        </div>
      </div>

      {viewType === "chart" ? (
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spend" fill="#64748b" barSize={30} />
              <Bar dataKey="savings" fill="#16a34a" barSize={30} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-2 overflow-hidden">
          {demoSupplierData.map((supplier) => (
            <Card 
              key={supplier.id}
              className={`${selectedSupplier.id === supplier.id ? 'border-primary' : ''} transition-all cursor-pointer hover:shadow-md`}
              onClick={() => setSelectedSupplier(supplier)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{supplier.name}</span>
                      {getTrendIndicator(supplier.trend)}
                      {supplier.issues > 0 && (
                        <Badge variant="warning" className="h-5 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {supplier.issues}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{supplier.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(supplier.annualSpend)}</div>
                    {supplier.savings > 0 && (
                      <div className="text-xs text-emerald-600">
                        Savings: {formatCurrency(supplier.savings)} ({formatPercentage(supplier.savingsPercent)})
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSupplier && viewType === "list" && (
        <Card className="mt-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-3">{selectedSupplier.name} Performance</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground">On-Time Delivery</p>
                  <p className="font-medium">{formatPercentage(selectedSupplier.onTimeDelivery)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quality Score</p>
                  <RatingStars rating={selectedSupplier.qualityScore} />
                </div>
                <div>
                  <p className="text-muted-foreground">Response Time</p>
                  <p className="font-medium">{formatPercentage(selectedSupplier.responseTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk Level</p>
                  <Badge 
                    className={getRiskLevel(selectedSupplier.riskScore).color}
                  >
                    {getRiskLevel(selectedSupplier.riskScore).label}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  outerRadius={80} 
                  data={getPerformanceMetrics(selectedSupplier)}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}