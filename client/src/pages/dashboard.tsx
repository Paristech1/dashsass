import { TicketCheck, Clock, CheckCircle, PieChart } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { StatusBreakdownChart } from "@/components/dashboard/status-breakdown";
import { PriorityChart } from "@/components/dashboard/priority-chart";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { TeamPerformance } from "@/components/dashboard/team-performance";
import { 
  useDashboardMetrics, 
  useTicketStatusBreakdown, 
  useTicketPriorityDistribution,
  useRecentTickets,
  useTeamPerformance
} from "@/hooks/use-tickets";

export default function Dashboard() {
  // Fetch dashboard data
  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { data: statusBreakdown, isLoading: isLoadingStatusBreakdown } = useTicketStatusBreakdown();
  const { data: priorityDistribution, isLoading: isLoadingPriorityDistribution } = useTicketPriorityDistribution();
  const { data: recentTickets, isLoading: isLoadingRecentTickets } = useRecentTickets();
  const { data: teamPerformance, isLoading: isLoadingTeamPerformance } = useTeamPerformance();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Tickets"
          value={isLoadingMetrics ? "..." : metrics?.totalTickets || 0}
          icon={<TicketCheck className="h-6 w-6" />}
          trendValue={isLoadingMetrics ? 0 : metrics?.totalTrend.count || 0}
          trendDirection={isLoadingMetrics ? "up" : metrics?.totalTrend.trend || "up"}
          trendLabel="from last week"
          iconBgColor="bg-primary-500"
        />
        <SummaryCard
          title="Open Tickets"
          value={isLoadingMetrics ? "..." : metrics?.openTickets || 0}
          icon={<TicketCheck className="h-6 w-6" />}
          trendValue={isLoadingMetrics ? 0 : metrics?.openTrend.count || 0}
          trendDirection={isLoadingMetrics ? "down" : metrics?.openTrend.trend || "down"}
          trendLabel="from last week"
          iconBgColor="bg-orange-500"
        />
        <SummaryCard
          title="Closed Today"
          value={isLoadingMetrics ? "..." : metrics?.closedToday || 0}
          icon={<CheckCircle className="h-6 w-6" />}
          trendValue={isLoadingMetrics ? 0 : metrics?.closedTrend.count || 0}
          trendDirection={isLoadingMetrics ? "up" : metrics?.closedTrend.trend || "up"}
          trendLabel="from yesterday"
          iconBgColor="bg-green-500"
        />
        <SummaryCard
          title="Response Time"
          value={isLoadingMetrics ? "..." : `${metrics?.averageResponseTime || 0} hrs`}
          icon={<Clock className="h-6 w-6" />}
          trendValue={isLoadingMetrics ? 0 : metrics?.responseTrend.hours || 0}
          trendDirection={isLoadingMetrics ? "down" : metrics?.responseTrend.trend || "down"}
          trendLabel="hrs from last week"
          iconBgColor="bg-purple-500"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusBreakdownChart 
          data={statusBreakdown || []} 
          isLoading={isLoadingStatusBreakdown} 
        />
        <PriorityChart 
          data={priorityDistribution || []} 
          isLoading={isLoadingPriorityDistribution} 
        />
      </div>
      
      {/* Recent Tickets and Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTickets 
          tickets={recentTickets || []} 
          isLoading={isLoadingRecentTickets} 
        />
        <TeamPerformance 
          data={teamPerformance || []} 
          isLoading={isLoadingTeamPerformance} 
        />
      </div>
    </div>
  );
}
