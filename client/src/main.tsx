import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Setup WebSocket connection for real-time updates
const setupWebSocket = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  const socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      // Handle updates based on message type
      if (data.type === 'ticket_update') {
        // Invalidate relevant queries to trigger refetch
        if (data.action === 'create' || data.action === 'update') {
          window.dispatchEvent(new CustomEvent('ticket-update', { detail: data }));
        }
      } else if (data.type === 'comment_update') {
        window.dispatchEvent(new CustomEvent('comment-update', { detail: data }));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    // Attempt to reconnect after a delay
    setTimeout(() => {
      setupWebSocket();
    }, 5000);
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return socket;
};

// Start WebSocket connection
setupWebSocket();

createRoot(document.getElementById("root")!).render(<App />);
