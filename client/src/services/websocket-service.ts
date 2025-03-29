/**
 * WebSocket Service
 * 
 * This service manages the WebSocket connection to receive real-time updates
 * from the server and dispatches custom events for components to listen to.
 */

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectInterval = 3000; // 3 seconds
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      // Determine WebSocket protocol based on page protocol
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.socket = new WebSocket(wsUrl);
      this.setupSocketListeners();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    this.socket.onclose = () => {
      console.log("WebSocket connection closed");
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any) {
    // Handle different message types
    if (message.type === 'ticket_update') {
      // Dispatch custom event for ticket updates
      const ticketEvent = new CustomEvent('ticket-update', {
        detail: {
          action: message.action,
          data: message.data
        }
      });
      window.dispatchEvent(ticketEvent);
    } else if (message.type === 'comment_update') {
      // Dispatch custom event for comment updates
      const commentEvent = new CustomEvent('comment-update', {
        detail: {
          action: message.action,
          data: message.data
        }
      });
      window.dispatchEvent(commentEvent);
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached. Giving up.");
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();