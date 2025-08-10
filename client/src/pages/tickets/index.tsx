import { useState } from "react";
import { useMyTickets } from "@/hooks/use-tickets";
import { TicketList } from "@/components/tickets/ticket-list";

export default function MyTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const { data: tickets, isLoading } = useMyTickets({
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">My Tickets</h1>
      
      <TicketList 
        tickets={tickets || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}
