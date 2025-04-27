"use client"

import React from "react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Users, 
  XCircle 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, formatCurrency } from "@/lib/utils"

// For demonstration purposes - in production this would come from the API
const demoNegotiationData = [
  {
    id: 1,
    supplier: "Acme Corp",
    category: "IT Services",
    initialAmount: 420000,
    currentAmount: 378000,
    savings: 42000,
    savingsPercentage: 0.1,
    status: "active",
    startDate: "2025-04-10T10:00:00Z",
    lastActivity: "2025-04-25T14:30:00Z",
    nextStepDate: "2025-04-29T11:00:00Z",
    nextStep: "Review counter-proposal",
    owner: {
      name: "Sarah Collins",
      avatar: "/avatars/sarah-collins.jpg",
      initials: "SC"
    },
    progress: 0.65,
    messages: 14,
    documents: 3,
    aiAssisted: true
  },
  {
    id: 2,
    supplier: "Global Logistics",
    category: "Logistics",
    initialAmount: 310000,
    currentAmount: 294500,
    savings: 15500,
    savingsPercentage: 0.05,
    status: "active",
    startDate: "2025-04-05T09:00:00Z",
    lastActivity: "2025-04-24T16:45:00Z",
    nextStepDate: "2025-04-28T10:30:00Z",
    nextStep: "Schedule final meeting",
    owner: {
      name: "James Wilson",
      avatar: "/avatars/james-wilson.jpg",
      initials: "JW"
    },
    progress: 0.85,
    messages: 22,
    documents: 5,
    aiAssisted: true
  },
  {
    id: 3,
    supplier: "Metro Consulting",
    category: "Professional Services",
    initialAmount: 275000,
    currentAmount: 275000,
    savings: 0,
    savingsPercentage: 0,
    status: "stalled",
    startDate: "2025-03-20T13:00:00Z",
    lastActivity: "2025-04-15T11:20:00Z",
    nextStepDate: "2025-04-30T14:00:00Z",
    nextStep: "Escalate to management",
    owner: {
      name: "Alex Chen",
      avatar: "/avatars/alex-chen.jpg",
      initials: "AC"
    },
    progress: 0.3,
    messages: 8,
    documents: 2,
    aiAssisted: false
  },
  {
    id: 4,
    supplier: "Apex Marketing",
    category: "Marketing",
    initialAmount: 195000,
    currentAmount: 173550,
    savings: 21450,
    savingsPercentage: 0.11,
    status: "completed",
    startDate: "2025-03-15T11:00:00Z",
    lastActivity: "2025-04-20T15:10:00Z",
    nextStepDate: null,
    nextStep: null,
    owner: {
      name: "Morgan Davis",
      avatar: "/avatars/morgan-davis.jpg",
      initials: "MD"
    },
    progress: 1,
    messages: 19,
    documents: 7,
    aiAssisted: true
  },
  {
    id: 5,
    supplier: "Office Solutions",
    category: "Office Supplies",
    initialAmount: 85000,
    currentAmount: 76500,
    savings: 8500,
    savingsPercentage: 0.1,
    status: "completed",
    startDate: "2025-03-10T10:30:00Z",
    lastActivity: "2025-04-12T09:45:00Z",
    nextStepDate: null,
    nextStep: null,
    owner: {
      name: "Taylor Reed",
      avatar: "/avatars/taylor-reed.jpg",
      initials: "TR"
    },
    progress: 1,
    messages: 11,
    documents: 4,
    aiAssisted: true
  }
]

const trendsData = [
  { month: 'Jan', negotiations: 4, savings: 45000 },
  { month: 'Feb', negotiations: 6, savings: 68000 },
  { month: 'Mar', negotiations: 5, savings: 52000 },
  { month: 'Apr', negotiations: 8, savings: 87450 },
]

// Get status badge styling
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return { variant: 'info', icon: <Clock className="h-3 w-3 mr-1" /> }
    case 'completed':
      return { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> }
    case 'stalled':
      return { variant: 'warning', icon: <XCircle className="h-3 w-3 mr-1" /> }
    default:
      return { variant: 'default', icon: null }
  }
}

// Format status text for display
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function NegotiationActivity() {
  // Get only recent negotiations
  const recentNegotiations = demoNegotiationData.slice(0, 3)
  
  // Calculate total savings across all negotiations
  const totalSavings = demoNegotiationData.reduce((sum, item) => sum + item.savings, 0)
  
  // Calculate completion rate
  const completedCount = demoNegotiationData.filter(n => n.status === 'completed').length
  const completionRate = completedCount / demoNegotiationData.length
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-background border shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{payload[0].name}: {payload[0].value}</p>
          <p className="text-sm">{payload[1].name}: {formatCurrency(payload[1].value)}</p>
        </Card>
      )
    }
    return null
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Savings</span>
            <span className="text-xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</span>
            <span className="text-xs text-muted-foreground mt-1">
              From {demoNegotiationData.length} negotiations
            </span>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Completion Rate</span>
            <span className="text-xl font-bold">{Math.round(completionRate * 100)}%</span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${completionRate * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
        <div className="space-y-2">
          {recentNegotiations.map((negotiation) => {
            const statusBadge = getStatusBadge(negotiation.status)
            
            return (
              <Card key={negotiation.id} className="p-3 transition-all hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{negotiation.supplier}</span>
                      <Badge variant={statusBadge.variant as any} className="flex items-center text-xs h-5">
                        {statusBadge.icon}
                        {formatStatus(negotiation.status)}
                      </Badge>
                      {negotiation.aiAssisted && (
                        <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs h-5">
                          AI-Assisted
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {negotiation.category} • Last active {formatDate(new Date(negotiation.lastActivity), { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: 'numeric' 
                      })}
                    </p>
                    
                    {negotiation.nextStep && (
                      <p className="text-xs mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-amber-500" />
                        {negotiation.nextStep} by {formatDate(new Date(negotiation.nextStepDate!), { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={negotiation.owner.avatar} alt={negotiation.owner.name} />
                        <AvatarFallback>{negotiation.owner.initials}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-0.5" />
                          {negotiation.messages}
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-0.5" />
                          {negotiation.documents}
                        </span>
                      </div>
                    </div>
                    
                    {negotiation.savings > 0 && (
                      <div className="text-xs text-emerald-600 font-medium mt-1">
                        Savings: {formatCurrency(negotiation.savings)} ({Math.round(negotiation.savingsPercentage * 100)}%)
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Negotiation Trends</h4>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendsData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="negotiations" 
                stroke="#64748b" 
                fill="#cbd5e1"
                name="Negotiations"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="savings" 
                stroke="#16a34a" 
                fill="#dcfce7"
                name="Savings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <Button variant="outline" size="sm" className="w-full">
        View All Negotiations
      </Button>
    </div>
  )
}