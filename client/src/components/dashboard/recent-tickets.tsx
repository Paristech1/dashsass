import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentTicketsProps {
  tickets: Ticket[];
  isLoading: boolean;
}

export function RecentTickets({ tickets, isLoading }: RecentTicketsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            // Skeleton loading state
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="py-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="flex-1 pr-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="flex space-x-2">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {tickets.map((ticket) => (
                <div key={ticket.id} className="py-4">
                  <div className="flex justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-medium text-gray-800 truncate" title={ticket.title}>
                        {ticket.title}
                      </h3>
                      <div className="text-xs text-gray-500 mb-2">
                        {ticket.ticketNumber} • {formatRelativeTime(ticket.createdAt)}
                      </div>
                      <div className="flex space-x-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <AssigneeAvatar assignedToId={ticket.assignedToId} />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/tickets">View All Tickets</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Format relative time
function formatRelativeTime(timestamp: string | Date): string {
  if (!timestamp) return "N/A";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return formatDistanceToNow(date, { addSuffix: true });
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusClasses: { [key: string]: string } = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    pending: "bg-amber-100 text-amber-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const statusDisplayNames: { [key: string]: string } = {
    open: "OPEN",
    in_progress: "IN PROGRESS",
    pending: "PENDING",
    resolved: "RESOLVED",
    closed: "CLOSED",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${statusClasses[status] || "bg-gray-100 text-gray-800"} uppercase text-xs`}
    >
      {statusDisplayNames[status] || status}
    </Badge>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const priorityClasses: { [key: string]: string } = {
    urgent: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${priorityClasses[priority] || "bg-gray-100 text-gray-800"} uppercase text-xs`}
    >
      {priority}
    </Badge>
  );
}

// Assignee avatar component
function AssigneeAvatar({ assignedToId }: { assignedToId: number | null }) {
  const [assignee, setAssignee] = useState({ name: "", avatarUrl: "" });

  useEffect(() => {
    if (assignedToId) {
      // In a real app, fetch user details from API
      // For now, use placeholder
      const placeholder = {
        name: ["Sarah Connor", "John Smith", "David Miller"][Math.min((assignedToId || 1) - 1, 2)],
        avatarUrl: "",
      };
      setAssignee(placeholder);
    }
  }, [assignedToId]);

  if (!assignedToId) return null;

  return (
    <img
      src={assignee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=0D8ABC&color=fff`}
      alt={assignee.name}
      className="h-8 w-8 rounded-full"
      title={assignee.name}
    />
  );
}
