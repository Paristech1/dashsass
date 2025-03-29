import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { websocketService } from "@/services/websocket-service";

/**
 * NotificationListener component
 * 
 * This component handles real-time ticket and comment updates via WebSocket
 * and displays toast notifications for relevant events.
 */
export function NotificationListener() {
  const { toast } = useToast();
  
  // Connect to the WebSocket server
  useEffect(() => {
    // Initialize WebSocket connection
    websocketService.connect();
    
    return () => {
      // Clean up the connection when component unmounts
      websocketService.disconnect();
    };
  }, []);

  // Listen for WebSocket events and show notifications
  useEffect(() => {
    const handleTicketUpdate = (event: CustomEvent) => {
      const { data, action } = event.detail;
      
      // Show different notifications based on the action type
      if (action === 'create') {
        toast({
          title: "New Ticket Created",
          description: (
            <div>
              <p className="font-medium">{data.ticketNumber}: {data.title}</p>
              <Link href={`/tickets/${data.id}`} className="text-primary underline text-sm">
                View ticket
              </Link>
            </div>
          ),
          duration: 5000,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tickets/recent'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      } else if (action === 'update') {
        // If viewing the ticket, no need for a notification as the UI will update
        if (window.location.pathname !== `/tickets/${data.id}`) {
          toast({
            title: "Ticket Updated",
            description: (
              <div>
                <p className="font-medium">{data.ticketNumber}: {data.title}</p>
                <Link href={`/tickets/${data.id}`} className="text-primary underline text-sm">
                  View updates
                </Link>
              </div>
            ),
            duration: 5000,
          });
        }
        
        // Invalidate queries to update data in background
        queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tickets/recent'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/${data.id}`] });
      }
    };

    const handleCommentUpdate = (event: CustomEvent) => {
      const { data } = event.detail;
      const ticketId = data.ticketId;
      
      // Get the ticket details to show in notification
      queryClient.fetchQuery({ 
        queryKey: [`/api/tickets/${ticketId}`],
      }).then((ticket: any) => {
        if (ticket) {
          // If not viewing the ticket details page, show notification
          if (window.location.pathname !== `/tickets/${ticketId}`) {
            toast({
              title: "New Comment",
              description: (
                <div>
                  <p className="font-medium">{ticket.ticketNumber}: {ticket.title}</p>
                  <Link href={`/tickets/${ticketId}`} className="text-primary underline text-sm">
                    View comment
                  </Link>
                </div>
              ),
              duration: 5000,
            });
          }
        }
      });
      
      // Invalidate the comments query to update UI
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/comments`] });
    };

    // Register event listeners
    window.addEventListener('ticket-update', handleTicketUpdate as EventListener);
    window.addEventListener('comment-update', handleCommentUpdate as EventListener);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('ticket-update', handleTicketUpdate as EventListener);
      window.removeEventListener('comment-update', handleCommentUpdate as EventListener);
    };
  }, []);

  // This component doesn't render anything
  return null;
}