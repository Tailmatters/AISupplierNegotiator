import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download } from "lucide-react";

// This is dummy data for the chart
const performanceData = {
  "Last 30 days": [
    { name: 'Week 1', savings: 12.3, duration: 3.5, success: 85 },
    { name: 'Week 2', savings: 15.8, duration: 4.2, success: 92 },
    { name: 'Week 3', savings: 14.2, duration: 3.8, success: 88 },
    { name: 'Week 4', savings: 18.5, duration: 5.1, success: 91 }
  ],
  "Last quarter": [
    { name: 'Month 1', savings: 14.5, duration: 4.1, success: 87 },
    { name: 'Month 2', savings: 16.3, duration: 4.4, success: 90 },
    { name: 'Month 3', savings: 15.2, duration: 4.0, success: 86 }
  ],
  "Year to date": [
    { name: 'Q1', savings: 13.2, duration: 3.8, success: 84 },
    { name: 'Q2', savings: 15.7, duration: 4.3, success: 89 },
    { name: 'Q3', savings: 17.1, duration: 4.5, success: 92 }
  ]
};

const statsData = {
  "Last 30 days": {
    averageSavings: 15.2,
    averageDuration: 4.2,
    successRate: 89,
    responseTime: 2.4
  },
  "Last quarter": {
    averageSavings: 15.3,
    averageDuration: 4.2,
    successRate: 87,
    responseTime: 2.6
  },
  "Year to date": {
    averageSavings: 15.3,
    averageDuration: 4.2,
    successRate: 88,
    responseTime: 2.5
  }
};

export function PerformanceChart() {
  const [timeRange, setTimeRange] = useState<keyof typeof performanceData>("Last 30 days");
  const [chartType, setChartType] = useState<'savings' | 'duration' | 'success'>('savings');
  
  const stats = statsData[timeRange];
  const data = performanceData[timeRange];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle>Recent Negotiations Performance</CardTitle>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={(value: keyof typeof performanceData) => setTimeRange(value)}>
              <SelectTrigger className="h-9 text-sm w-[140px]">
                <SelectValue>{timeRange}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last quarter">Last quarter</SelectItem>
                <SelectItem value="Year to date">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex space-x-2 mb-3">
            <Button 
              variant={chartType === 'savings' ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartType('savings')}
            >
              Savings
            </Button>
            <Button 
              variant={chartType === 'duration' ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartType('duration')}
            >
              Duration
            </Button>
            <Button 
              variant={chartType === 'success' ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartType('success')}
            >
              Success Rate
            </Button>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'savings' ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="savings" name="Savings %" fill="#1F56A6" />
                </BarChart>
              ) : chartType === 'duration' ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="duration" name="Avg. Duration (days)" stroke="#3A7BCD" strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" name="Success Rate %" fill="#27AE60" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-50 rounded-md">
            <p className="text-neutral-500 text-sm">Average Savings</p>
            <p className="text-2xl font-bold text-neutral-800">{stats.averageSavings}%</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-md">
            <p className="text-neutral-500 text-sm">Average Duration</p>
            <p className="text-2xl font-bold text-neutral-800">{stats.averageDuration} days</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-md">
            <p className="text-neutral-500 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-neutral-800">{stats.successRate}%</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-md">
            <p className="text-neutral-500 text-sm">Response Time</p>
            <p className="text-2xl font-bold text-neutral-800">{stats.responseTime} hrs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
