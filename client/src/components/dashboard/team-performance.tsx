import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamPerformanceMetric } from "@/hooks/use-tickets";

interface TeamPerformanceProps {
  data: TeamPerformanceMetric[];
  isLoading: boolean;
}

export function TeamPerformance({ data, isLoading }: TeamPerformanceProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Avg Response
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Satisfaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-secondary rounded-full"></div>
                        <div className="ml-3">
                          <div className="h-4 bg-secondary rounded w-24 mb-1"></div>
                          <div className="h-3 bg-secondary rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="h-4 bg-secondary rounded w-8"></div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="h-4 bg-secondary rounded w-8"></div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="h-4 bg-secondary rounded w-12"></div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="h-4 bg-secondary rounded w-12"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg Response
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Satisfaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {data.map((member) => (
                <tr key={member.userId}>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userName)}&background=0D8ABC&color=fff`} />
                        <AvatarFallback>{member.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">{member.userName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{member.userRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                    {member.assigned}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                    {member.resolved}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                    {member.averageResponseTime}h
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{member.satisfaction}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
