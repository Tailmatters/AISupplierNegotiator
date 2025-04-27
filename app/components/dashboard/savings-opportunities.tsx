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
  LabelList,
  Cell
} from "recharts"
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  TrendingDown,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercentage } from "@/lib/utils"

// For demonstration purposes - in production this would come from the API
const demoSavingsData = [
  { 
    category: "IT Services", 
    currentSpend: 420000, 
    potentialSavings: 67200,
    savingsPercentage: 0.16,
    confidence: 0.85,
    strategies: [
      { name: "Supplier consolidation", impact: "High", description: "Consolidate 5 suppliers to 2" },
      { name: "Contract renegotiation", impact: "Medium", description: "Renew primary contract with better terms" }
    ],
    timeToProcure: "3-4 weeks"
  },
  { 
    category: "Office Supplies", 
    currentSpend: 85000, 
    potentialSavings: 12750,
    savingsPercentage: 0.15,
    confidence: 0.9,
    strategies: [
      { name: "Bulk purchasing", impact: "Medium", description: "Implement quarterly bulk orders" },
      { name: "Standardize catalog", impact: "Low", description: "Limit product selection to optimize pricing" }
    ],
    timeToProcure: "1-2 weeks"
  },
  { 
    category: "Logistics", 
    currentSpend: 310000, 
    potentialSavings: 37200,
    savingsPercentage: 0.12,
    confidence: 0.7,
    strategies: [
      { name: "Carrier optimization", impact: "High", description: "Redistribute shipments across carriers" },
      { name: "Route planning", impact: "Medium", description: "Implement route optimization software" }
    ],
    timeToProcure: "2-3 months"
  },
  { 
    category: "Marketing", 
    currentSpend: 195000, 
    potentialSavings: 21450,
    savingsPercentage: 0.11,
    confidence: 0.75,
    strategies: [
      { name: "Agency consolidation", impact: "Medium", description: "Reduce from 3 agencies to 1" },
      { name: "Performance-based contracts", impact: "High", description: "Shift to performance metrics" }
    ],
    timeToProcure: "1-2 months"
  },
  { 
    category: "Professional Services", 
    currentSpend: 275000, 
    potentialSavings: 22000,
    savingsPercentage: 0.08,
    confidence: 0.65,
    strategies: [
      { name: "Fixed-price agreements", impact: "Medium", description: "Convert time-based to fixed-price" },
      { name: "Skill-based sourcing", impact: "Medium", description: "Match resource level to requirements" }
    ],
    timeToProcure: "1-3 months"
  }
]

// Impact color mapping
const impactColors = {
  "High": "#16a34a", // green-600
  "Medium": "#ca8a04", // yellow-600
  "Low": "#64748b" // slate-500
}

// Bar chart colors with opacity variation by confidence
const getBarColor = (confidence: number) => {
  return `rgba(14, 165, 233, ${0.5 + confidence * 0.5})`
}

export function SavingsOpportunities() {
  const [sortBy, setSortBy] = useState<"amount" | "percentage">("amount")
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  
  // Sort the data based on the selected sort method
  const sortedData = [...demoSavingsData].sort((a, b) => {
    if (sortBy === "amount") {
      return b.potentialSavings - a.potentialSavings
    } else {
      return b.savingsPercentage - a.savingsPercentage
    }
  })

  // Format the data for the chart
  const chartData = sortedData.map(item => ({
    category: item.category,
    savings: item.potentialSavings,
    percentage: item.savingsPercentage,
    confidence: item.confidence
  }))

  // Calculate total potential savings
  const totalSavings = demoSavingsData.reduce(
    (sum, item) => sum + item.potentialSavings, 
    0
  )

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Card className="p-2 bg-background border shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Savings: {formatCurrency(data.savings)}
          </p>
          <p className="text-sm">
            Rate: {formatPercentage(data.percentage)}
          </p>
          <p className="text-xs text-muted-foreground">
            Confidence: {formatPercentage(data.confidence)}
          </p>
        </Card>
      )
    }
    return null
  }

  // Custom axis tick formatter for currency
  const currencyTickFormatter = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  // Toggle expanded item
  const toggleExpandedItem = (category: string) => {
    if (expandedItem === category) {
      setExpandedItem(null)
    } else {
      setExpandedItem(category)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-xl flex items-center gap-1">
            <TrendingDown className="text-blue-500 h-5 w-5" />
            <span>{formatCurrency(totalSavings)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Identified potential savings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={sortBy === "amount" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSortBy("amount")}
          >
            By Amount
          </Button>
          <Button 
            variant={sortBy === "percentage" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSortBy("percentage")}
          >
            By %
          </Button>
        </div>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis 
              tickFormatter={currencyTickFormatter} 
              tick={{ fontSize: 12 }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="savings" fill="#0ea5e9">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.confidence)} />
              ))}
              <LabelList 
                dataKey="percentage" 
                position="top" 
                formatter={(value: number) => formatPercentage(value)} 
                style={{ fontSize: '11px' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4">
        <Accordion type="single" collapsible>
          {sortedData.map((item, index) => (
            <AccordionItem key={index} value={item.category}>
              <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.category}</span>
                    <Badge variant="outline" className="text-blue-500 bg-blue-50">
                      {formatPercentage(item.savingsPercentage)}
                    </Badge>
                  </div>
                  <span className="text-right font-medium">
                    {formatCurrency(item.potentialSavings)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="bg-muted/30 border-0">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Spend</p>
                        <p className="font-medium">{formatCurrency(item.currentSpend)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Implementation Time</p>
                        <p className="font-medium">{item.timeToProcure}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence Level</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${item.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground mb-2">Recommended Strategies</p>
                      <div className="space-y-2">
                        {item.strategies.map((strategy, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div 
                              className="mt-0.5 p-1 rounded-full"
                              style={{ backgroundColor: impactColors[strategy.impact as keyof typeof impactColors] + '20' }}
                            >
                              <Lightbulb className="h-3.5 w-3.5" style={{ color: impactColors[strategy.impact as keyof typeof impactColors] }} />
                            </div>
                            <div>
                              <p className="font-medium flex items-center">
                                {strategy.name}
                                <Badge 
                                  variant="outline" 
                                  className="ml-2 text-xs"
                                  style={{ 
                                    color: impactColors[strategy.impact as keyof typeof impactColors],
                                    backgroundColor: impactColors[strategy.impact as keyof typeof impactColors] + '10'
                                  }}
                                >
                                  {strategy.impact} Impact
                                </Badge>
                              </p>
                              <p className="text-muted-foreground text-xs">{strategy.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Start Negotiation
                    </Button>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}