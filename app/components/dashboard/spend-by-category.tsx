"use client"

import React, { useState } from "react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface SpendCategoryData {
  category: string
  subcategory?: string
  total: number
}

interface SpendByCategoryProps {
  data: SpendCategoryData[]
}

// Color palette for categories
const CATEGORY_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A4DE6C", 
  "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B", "#6A7FDB"
]

export function SpendByCategory({ data }: SpendByCategoryProps) {
  const [viewType, setViewType] = useState<"chart" | "table">("chart")
  
  // Calculate total spend
  const totalSpend = data.reduce((sum, item) => sum + item.total, 0)
  
  // Sort data by total in descending order
  const sortedData = [...data].sort((a, b) => b.total - a.total)
  
  // Add percentage and color to each item
  const processedData = sortedData.map((item, index) => ({
    ...item,
    percentage: item.total / totalSpend,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }))

  // Custom tooltip component for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Card className="p-3 bg-background border shadow-md">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(data.total)}</p>
          <p className="text-xs">{formatPercentage(data.percentage)}</p>
        </Card>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 space-x-2">
        <Button 
          variant={viewType === "chart" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setViewType("chart")}
        >
          Chart
        </Button>
        <Button 
          variant={viewType === "table" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setViewType("table")}
        >
          Table
        </Button>
      </div>
      
      {viewType === "chart" ? (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                nameKey="category"
                label={({ category, percentage }) => 
                  `${category}: ${formatPercentage(percentage)}`
                }
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pl-0">Category</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2 pr-0">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((item, index) => (
                <tr key={index} className="border-b border-muted hover:bg-muted/30">
                  <td className="py-2 pl-0 font-medium flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    {item.category}
                  </td>
                  <td className="py-2 text-right">{formatCurrency(item.total)}</td>
                  <td className="py-2 pr-0 text-right">{formatPercentage(item.percentage)}</td>
                </tr>
              ))}
              <tr className="font-medium">
                <td className="py-2 pl-0">Total</td>
                <td className="py-2 text-right">{formatCurrency(totalSpend)}</td>
                <td className="py-2 pr-0 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}