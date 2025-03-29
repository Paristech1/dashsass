import { TicketForm } from "@/components/tickets/ticket-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTicketPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Create New Ticket</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketForm />
        </CardContent>
      </Card>
    </div>
  );
}
