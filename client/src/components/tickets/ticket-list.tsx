import { useState } from "react";
import { Link, useLocation } from "wouter";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ticket } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, Filter, TicketIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
}

export function TicketList({ tickets, isLoading }: TicketListProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine if we're on the "My Tickets" page to enable bulk operations
  const isMyTicketsPage = location === "/tickets";

  // Filter tickets based on filters and search
  const filteredTickets = tickets
    .filter(ticket => {
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesSearch = !searchQuery || 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    })
    // Sort tickets in descending order by createdAt date (most recent first)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
  // Select or deselect a ticket
  const toggleTicketSelection = (ticketId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newSelectedTickets = new Set(selectedTickets);
    if (selectedTickets.has(ticketId)) {
      newSelectedTickets.delete(ticketId);
    } else {
      newSelectedTickets.add(ticketId);
    }
    setSelectedTickets(newSelectedTickets);
  };
  
  // Select or deselect all visible tickets
  const toggleSelectAll = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      const allIds = filteredTickets.map(ticket => ticket.id);
      setSelectedTickets(new Set(allIds));
    }
  };
  
  // Mass update ticket status
  const updateSelectedTicketsStatus = async (newStatus: string) => {
    if (selectedTickets.size === 0) return;
    
    setIsUpdating(true);
    try {
      // Convert Set to Array for iteration
      const ticketIds = Array.from(selectedTickets);
      
      // For each selected ticket, update its status
      for (const ticketId of ticketIds) {
        await fetch(`/api/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/status-breakdown'] });
      
      toast({
        title: "Status Updated",
        description: `Updated ${selectedTickets.size} ticket${selectedTickets.size > 1 ? 's' : ''} to ${getStatusDisplayName(newStatus)}`,
        variant: "default",
      });
      
      // Clear selections after successful update
      setSelectedTickets(new Set());
    } catch (error) {
      console.error("Error updating tickets:", error);
      toast({
        title: "Error",
        description: "Failed to update tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={`ticket-skeleton-${index}`} className="p-4 border rounded-md animate-pulse">
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
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            {/* Show bulk actions dropdown only on My Tickets page with selections */}
            {isMyTicketsPage && selectedTickets.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : `${selectedTickets.size} Selected`} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => updateSelectedTicketsStatus('open')}>
                      <span className="text-blue-500 mr-2">⬤</span> Set to Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSelectedTicketsStatus('in_progress')}>
                      <span className="text-purple-500 mr-2">⬤</span> Set to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSelectedTicketsStatus('pending')}>
                      <span className="text-amber-500 mr-2">⬤</span> Set to Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSelectedTicketsStatus('resolved')}>
                      <span className="text-green-500 mr-2">⬤</span> Set to Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSelectedTicketsStatus('closed')}>
                      <span className="text-gray-500 mr-2">⬤</span> Set to Closed
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button asChild>
              <Link href="/tickets/create">Create Ticket</Link>
            </Button>
          </div>
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
        
        {/* Select all option on My Tickets page */}
        {isMyTicketsPage && filteredTickets.length > 0 && (
          <div className="flex items-center mt-4">
            <Checkbox 
              id="select-all"
              checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
              onCheckedChange={() => toggleSelectAll({} as React.MouseEvent)}
              className="mr-2"
            />
            <label htmlFor="select-all" className="text-sm cursor-pointer">
              Select All ({filteredTickets.length} tickets)
            </label>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredTickets.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No tickets found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="relative">
                {isMyTicketsPage && (
                  <div 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" 
                    onClick={(e) => toggleTicketSelection(ticket.id, e)}
                  >
                    <Checkbox 
                      checked={selectedTickets.has(ticket.id)}
                      className="pointer-events-none"
                    />
                  </div>
                )}
                <Link href={`/tickets/${ticket.id}`}>
                  <div 
                    className={`p-4 border rounded-md hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer 
                      ${isMyTicketsPage ? 'pl-12' : ''} 
                      ${selectedTickets.has(ticket.id) ? 'bg-primary-50 border-primary-200' : ''}
                    `}
                  >
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
              </div>
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

// Get status display name
function getStatusDisplayName(status: string): string {
  const displayNames: { [key: string]: string } = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };
  
  return displayNames[status] || status;
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

  return (
    <Badge 
      variant="outline" 
      className={`${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {getStatusDisplayName(status)}
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
