import { useState } from "react";
import { useAllTickets } from "@/hooks/use-tickets";
import { TicketList } from "@/components/tickets/ticket-list";

export default function AllTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const { data: tickets, isLoading } = useAllTickets({
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">All Tickets</h1>
      
      <TicketList 
        tickets={tickets || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}