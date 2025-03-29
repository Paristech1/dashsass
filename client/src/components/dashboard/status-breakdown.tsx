import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBreakdown } from "@/hooks/use-tickets";

interface StatusBreakdownChartProps {
  data: StatusBreakdown[];
  isLoading: boolean;
}

interface StatusColorMap {
  [key: string]: string;
}

export function StatusBreakdownChart({ data, isLoading }: StatusBreakdownChartProps) {
  // Status to color mapping
  const statusColors: StatusColorMap = {
    open: "bg-blue-500",
    in_progress: "bg-purple-500",
    pending: "bg-amber-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",
  };
  
  // Status to display name mapping
  const statusDisplayNames: { [key: string]: string } = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };

  // Calculate total tickets
  const totalTickets = data.reduce((sum, item) => sum + item.count, 0);

  // Skeleton loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Ticket Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={`status-loading-${index}`}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-gray-300 rounded-full"
                    style={{ width: `${(index * 20)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Ticket Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.status}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{statusDisplayNames[item.status] || item.status}</span>
                <span className="text-gray-500">
                  {item.count} tickets ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 ${statusColors[item.status] || "bg-gray-500"} rounded-full`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <span>Total: {totalTickets} tickets</span>
          <span>Last 30 days</span>
        </div>
      </CardContent>
    </Card>
  );
}
