import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Define types for our API responses
interface StatusDataItem {
  status: string;
  count: number;
}

interface PriorityDataItem {
  priority: string;
  count: number;
}

interface PerformanceDataItem {
  userId: number;
  userName: string;
  open: number;
  resolved: number;
  avgResolutionTime: number;
}

// Mock colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7days");
  
  // Fetch status distribution data
  const { data: statusData } = useQuery<StatusDataItem[]>({
    queryKey: ['/api/dashboard/status-breakdown'],
  });
  
  // Fetch priority distribution data
  const { data: priorityData } = useQuery<PriorityDataItem[]>({
    queryKey: ['/api/dashboard/priority-distribution'],
  });
  
  // Fetch team performance metrics
  const { data: performanceData } = useQuery<PerformanceDataItem[]>({
    queryKey: ['/api/dashboard/team-performance'],
  });
  
  return (
    <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <Select
          value={period}
          onValueChange={setPeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ticket Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Status Distribution</CardTitle>
                <CardDescription>Current distribution of tickets by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        nameKey="status"
                        dataKey="count"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({status}) => status}
                      >
                        {statusData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Ticket Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Priority Distribution</CardTitle>
                <CardDescription>Current distribution of tickets by priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priorityData || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Agent performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="userName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Resolved" dataKey="resolved" fill="#0088FE" />
                    <Bar name="Open" dataKey="open" fill="#00C49F" />
                    <Bar name="Avg. Resolution Time (hours)" dataKey="avgResolutionTime" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Trends</CardTitle>
              <CardDescription>Ticket volume over time</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-80">
                <p className="text-muted-foreground">
                  Trend data will be displayed here in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 