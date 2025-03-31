import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  loading?: boolean;
}

export function StatCard({ title, value, icon, change, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-neutral-500 text-sm font-medium">{title}</h3>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-neutral-800">{value}</p>
        {change && (
          <div className="flex items-center mt-2 text-xs">
            <span 
              className={`flex items-center mr-1 ${
                change.trend === "up" 
                  ? "text-green-500" 
                  : change.trend === "down" 
                  ? "text-red-500" 
                  : "text-neutral-500"
              }`}
            >
              {change.trend === "up" && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
              {change.trend === "down" && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {change.value}%
            </span>
            <span className="text-neutral-500">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
