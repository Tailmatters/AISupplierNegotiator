import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { NewNegotiation } from "@/components/dashboard/new-negotiation";
import { OngoingNegotiations } from "@/components/dashboard/ongoing-negotiations";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SuppliersTable } from "@/components/dashboard/suppliers-table";
import { MessageCircle, CheckCircle2, Building2, DollarSign } from "lucide-react";

export default function DashboardPage() {
  // Fetch dashboard stats
  const { 
    data: stats, 
    isLoading: statsLoading,
    isError: statsError
  } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch negotiations for the ongoing negotiations section
  const { 
    data: negotiations, 
    isLoading: negotiationsLoading,
    isError: negotiationsError
  } = useQuery({
    queryKey: ["/api/negotiations"],
  });

  // Only show active/pending negotiations in the ongoing section
  const ongoingNegotiations = negotiations?.filter(
    (n: any) => n.status === 'active' || n.status === 'pending'
  ).slice(0, 4) || [];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
          <p className="text-neutral-500">Overview of your procurement activities and negotiations</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Negotiations"
            value={stats?.activeNegotiations || 0}
            icon={<MessageCircle className="h-5 w-5" />}
            change={{ value: 8, trend: "up" }}
            loading={statsLoading}
          />
          <StatCard
            title="Completed Negotiations"
            value={stats?.completedNegotiations || 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            change={{ value: 12, trend: "up" }}
            loading={statsLoading}
          />
          <StatCard
            title="Registered Suppliers"
            value={stats?.suppliers || 0}
            icon={<Building2 className="h-5 w-5" />}
            change={{ value: 5, trend: "up" }}
            loading={statsLoading}
          />
          <StatCard
            title="Cost Saved"
            value={`$${stats?.costSaved || 0}K`}
            icon={<DollarSign className="h-5 w-5" />}
            change={{ value: 18, trend: "up" }}
            loading={statsLoading}
          />
        </div>

        {/* New negotiation and ongoing negotiations */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Create new negotiation */}
          <div className="lg:col-span-2">
            <NewNegotiation />
          </div>
          
          {/* Ongoing negotiations */}
          <div className="lg:col-span-3">
            <OngoingNegotiations 
              negotiations={ongoingNegotiations}
              isLoading={negotiationsLoading}
              isError={negotiationsError}
            />
          </div>
        </div>
        
        {/* Negotiation performance */}
        <div className="mb-6">
          <PerformanceChart />
        </div>
        
        {/* Recent suppliers */}
        <div>
          <SuppliersTable />
        </div>
      </div>
    </Layout>
  );
}
