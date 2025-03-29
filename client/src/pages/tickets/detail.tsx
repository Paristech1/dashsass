import { TicketDetail } from "@/components/tickets/ticket-detail";

interface TicketDetailPageProps {
  id: string;
}

export default function TicketDetailPage({ id }: TicketDetailPageProps) {
  return (
    <div className="space-y-6">
      <TicketDetail ticketId={id} />
    </div>
  );
}
