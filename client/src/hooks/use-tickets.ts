import { useQuery } from "@tanstack/react-query";
import { Ticket } from "@shared/schema";

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  closedToday: number;
  averageResponseTime: number;
  totalTrend: { count: number; trend: 'up' | 'down' };
  openTrend: { count: number; trend: 'up' | 'down' };
  closedTrend: { count: number; trend: 'up' | 'down' };
  responseTrend: { hours: number; trend: 'up' | 'down' };
}

export interface TeamPerformanceMetric {
  userId: number;
  userName: string;
  userRole: string;
  avatarUrl: string | null;
  assigned: number;
  resolved: number;
  averageResponseTime: number;
  satisfaction: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
}

// Hook to fetch dashboard metrics
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
  });
}

// Hook to fetch team performance metrics
export function useTeamPerformance() {
  return useQuery<TeamPerformanceMetric[]>({
    queryKey: ['/api/dashboard/team-performance'],
  });
}

// Hook to fetch ticket status breakdown
export function useTicketStatusBreakdown() {
  return useQuery<StatusBreakdown[]>({
    queryKey: ['/api/dashboard/status-breakdown'],
  });
}

// Hook to fetch ticket priority distribution
export function useTicketPriorityDistribution() {
  return useQuery<PriorityDistribution[]>({
    queryKey: ['/api/dashboard/priority-distribution'],
  });
}

// Hook to fetch recent tickets
export function useRecentTickets(limit: number = 5) {
  return useQuery<Ticket[]>({
    queryKey: [`/api/tickets/recent?limit=${limit}`],
  });
}

// Hook to fetch all tickets
export function useAllTickets(filters?: { status?: string; priority?: string }) {
  let queryString = '/api/tickets';
  const queryParams: string[] = [];
  
  if (filters?.status && filters.status !== 'all') {
    queryParams.push(`status=${filters.status}`);
  }
  
  if (filters?.priority && filters.priority !== 'all') {
    queryParams.push(`priority=${filters.priority}`);
  }
  
  if (queryParams.length > 0) {
    queryString += `?${queryParams.join('&')}`;
  }
  
  return useQuery<Ticket[]>({
    queryKey: [queryString],
  });
}

// Hook to fetch a single ticket by ID
export function useTicket(id: string | number) {
  return useQuery<Ticket>({
    queryKey: [`/api/tickets/${id}`],
    enabled: !!id,
  });
}
