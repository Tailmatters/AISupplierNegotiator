import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MessageCircle, UserRound, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Negotiation {
  id: number;
  title: string;
  status: string;
  supplier: {
    name: string;
    contactPerson: string;
  };
  startedAt: string;
  messageCount: number;
}

interface OngoingNegotiationsProps {
  negotiations: Negotiation[];
  isLoading: boolean;
  isError: boolean;
}

export function OngoingNegotiations({ 
  negotiations, 
  isLoading, 
  isError 
}: OngoingNegotiationsProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">In Progress</Badge>;
      case 'pending':
      case 'awaiting response':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Awaiting Response</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Ongoing Negotiations</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-neutral-100 rounded-md p-4 mb-4">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-36 mr-2" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="flex items-center mt-3">
                <Skeleton className="h-3 w-24 mr-4" />
                <Skeleton className="h-3 w-24 mr-4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ongoing Negotiations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-neutral-500">Failed to load negotiations</p>
            <Button variant="outline" className="mt-2">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (negotiations.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ongoing Negotiations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">No active negotiations</p>
            <Link href="/negotiations/new">
              <Button>Start a New Negotiation</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Ongoing Negotiations</CardTitle>
          <Link href="/negotiations">
            <Button variant="link" className="text-primary text-sm">View all</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {negotiations.map((negotiation) => (
          <div 
            key={negotiation.id} 
            className="border border-neutral-100 rounded-md p-4 mb-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-neutral-800 font-medium">{negotiation.title}</span>
                  <span className="ml-2">
                    {getStatusBadge(negotiation.status)}
                  </span>
                </div>
                <p className="text-neutral-500 text-sm mt-1">{negotiation.supplier.name}</p>
              </div>
              <Link href={`/negotiations/${negotiation.id}`}>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                  Resume
                </Button>
              </Link>
            </div>
            <div className="flex items-center mt-3 text-xs text-neutral-500">
              <div className="flex items-center mr-4">
                <Calendar className="w-3 h-3 mr-1" />
                <span>
                  {negotiation.startedAt
                    ? `Started ${formatDistanceToNow(new Date(negotiation.startedAt), { addSuffix: true })}`
                    : "Recently started"}
                </span>
              </div>
              <div className="flex items-center mr-4">
                <UserRound className="w-3 h-3 mr-1" />
                <span>{negotiation.supplier.contactPerson || "Contact unavailable"}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                <span>{negotiation.messageCount || 0} messages</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
