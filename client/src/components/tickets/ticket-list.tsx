import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ticket } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
}

export function TicketList({ tickets, isLoading }: TicketListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter tickets based on filters and search
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesSearch = !searchQuery || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          {/* Filter controls skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-pulse">
            <div className="w-full sm:w-60 h-10 bg-gray-200 rounded"></div>
            <div className="w-full sm:w-60 h-10 bg-gray-200 rounded"></div>
            <div className="w-full sm:w-60 h-10 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Ticket list skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="p-4 border rounded-md animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle>Tickets</CardTitle>
          <Button asChild className="mt-2 sm:mt-0">
            <Link href="/tickets/create">Create Ticket</Link>
          </Button>
        </div>
        
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="w-full sm:w-60">
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTickets.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No tickets found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <div className="p-4 border rounded-md hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-500">
                        {ticket.ticketNumber} • Created {formatRelativeTime(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-col items-end">
                      <AssigneeAvatar assignedToId={ticket.assignedToId} />
                      <div className="flex gap-2 mt-1">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
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
  const statusColors: { [key: string]: string } = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-purple-100 text-purple-800 border-purple-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const displayNames: { [key: string]: string } = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {displayNames[status] || status}
    </Badge>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const priorityColors: { [key: string]: string } = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${priorityColors[priority] || "bg-gray-100 text-gray-800 border-gray-200"} capitalize`}
    >
      {priority}
    </Badge>
  );
}

// Assignee avatar component
function AssigneeAvatar({ assignedToId }: { assignedToId: number | null }) {
  if (!assignedToId) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  // In a real application, you would fetch the user data
  // For this example, we'll use placeholder data
  const assigneeData = {
    name: ["Sarah Connor", "John Smith", "David Miller"][Math.min((assignedToId || 1) - 1, 2)],
    avatarUrl: "",
  };

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage 
        src={assigneeData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(assigneeData.name)}&background=0D8ABC&color=fff`} 
        alt={assigneeData.name} 
      />
      <AvatarFallback>{assigneeData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
    </Avatar>
  );
}
