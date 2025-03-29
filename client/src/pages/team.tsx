import { useQuery } from "@tanstack/react-query";
import { useTeamPerformance } from "@/hooks/use-tickets";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, LineChart } from "recharts";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { User, Users, CheckCircle, Clock, Star } from "lucide-react";

export default function TeamPage() {
  // Fetch team performance data
  const { data: teamPerformance, isLoading } = useTeamPerformance();
  
  // Fetch users data
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Prepare data for the chart
  const chartData = teamPerformance?.map(member => ({
    name: member.userName.split(' ')[0], // Just use first name for chart
    assigned: member.assigned,
    resolved: member.resolved,
    responseTime: member.averageResponseTime,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Users className="mr-2 h-6 w-6" />
          Team Performance
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active support agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : calculateResolutionRate(teamPerformance)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Tickets resolved vs assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : calculateAvgResponseTime(teamPerformance)} hrs
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all team members</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Team metrics for tickets assigned, resolved, and response time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="assigned" name="Tickets Assigned" fill="#3b82f6" />
                  <Bar yAxisId="left" dataKey="resolved" name="Tickets Resolved" fill="#22c55e" />
                  <Bar yAxisId="right" dataKey="responseTime" name="Avg Response Time (hrs)" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-md">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : teamPerformance && teamPerformance.length > 0 ? (
            <div className="space-y-6">
              {teamPerformance.map((member) => (
                <div key={member.userId} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-md hover:border-primary-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userName)}&background=0D8ABC&color=fff`} />
                      <AvatarFallback>{member.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.userName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{member.userRole}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Assigned
                      </div>
                      <div className="font-semibold">{member.assigned}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolved
                      </div>
                      <div className="font-semibold">{member.resolved}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        Response Time
                      </div>
                      <div className="font-semibold">{member.averageResponseTime}h</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <Star className="w-4 h-4 mr-1" />
                        Satisfaction
                      </div>
                      <div className="font-semibold">{member.satisfaction}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No team members found</h3>
              <p className="text-gray-500 mt-2">
                Add team members to start tracking performance
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to calculate average resolution rate
function calculateResolutionRate(teamData?: Array<any>): string {
  if (!teamData || teamData.length === 0) return "0";
  
  let totalAssigned = 0;
  let totalResolved = 0;
  
  teamData.forEach(member => {
    totalAssigned += member.assigned;
    totalResolved += member.resolved;
  });
  
  const rate = totalAssigned > 0 ? (totalResolved / totalAssigned) * 100 : 0;
  return rate.toFixed(0);
}

// Helper function to calculate average response time
function calculateAvgResponseTime(teamData?: Array<any>): string {
  if (!teamData || teamData.length === 0) return "0";
  
  let totalResponseTime = 0;
  
  teamData.forEach(member => {
    totalResponseTime += member.averageResponseTime;
  });
  
  const avgTime = totalResponseTime / teamData.length;
  return avgTime.toFixed(1);
}
