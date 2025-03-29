import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { PriorityDistribution } from "@/hooks/use-tickets";

interface PriorityChartProps {
  data: PriorityDistribution[];
  isLoading: boolean;
}

export function PriorityChart({ data, isLoading }: PriorityChartProps) {
  // Formatting the data for the chart
  const chartData = data.map((item) => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    value: item.count,
    fill: getPriorityColor(item.priority),
  }));

  // Skeleton loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-end animate-pulse">
            <div className="flex items-end w-full justify-around">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-16 bg-gray-200 rounded-t-md"
                  style={{ height: `${Math.random() * 150 + 50}px` }}
                ></div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            Tickets by Priority
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} tickets`, 'Count']}
                labelFormatter={(label) => `Priority: ${label}`}
              />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          Tickets by Priority
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get colors based on priority
function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return '#ef4444'; // red
    case 'high':
      return '#f97316'; // orange
    case 'medium':
      return '#eab308'; // yellow
    case 'low':
      return '#22c55e'; // green
    default:
      return '#9ca3af'; // gray
  }
}
