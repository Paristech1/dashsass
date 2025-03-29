import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTicketSchema, insertCommentSchema, insertUserSchema } from "@shared/schema";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Health check endpoint
  router.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
  
  // ===== DASHBOARD ENDPOINTS =====
  
  // Get dashboard metrics
  router.get("/dashboard/metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });
  
  // Get team performance metrics
  router.get("/dashboard/team-performance", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getTeamPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team performance metrics" });
    }
  });
  
  // Get ticket status breakdown
  router.get("/dashboard/status-breakdown", async (req: Request, res: Response) => {
    try {
      const breakdown = await storage.getTicketStatusBreakdown();
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status breakdown" });
    }
  });
  
  // Get ticket priority distribution
  router.get("/dashboard/priority-distribution", async (req: Request, res: Response) => {
    try {
      const distribution = await storage.getTicketPriorityDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch priority distribution" });
    }
  });
  
  // ===== USER ENDPOINTS =====
  
  // Get all users
  router.get("/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Get user by ID
  router.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // Create user
  router.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  // Update user
  router.patch("/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // ===== TICKET ENDPOINTS =====
  
  // Get all tickets
  router.get("/tickets", async (req: Request, res: Response) => {
    try {
      let tickets;
      
      // Handle query params for filtering
      const { status, assignedTo, reportedBy, priority } = req.query;
      
      if (status) {
        tickets = await storage.getTicketsByStatus(status as string);
      } else if (assignedTo) {
        tickets = await storage.getTicketsByAssignee(parseInt(assignedTo as string));
      } else if (reportedBy) {
        tickets = await storage.getTicketsByReporter(parseInt(reportedBy as string));
      } else if (priority) {
        tickets = await storage.getTicketsByPriority(priority as string);
      } else {
        tickets = await storage.getAllTickets();
      }
      
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });
  
  // Get recent tickets
  router.get("/tickets/recent", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const tickets = await storage.getRecentTickets(limit);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent tickets" });
    }
  });
  
  // Get ticket by ID
  router.get("/tickets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });
  
  // Create ticket
  router.post("/tickets", async (req: Request, res: Response) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const newTicket = await storage.createTicket(ticketData);
      
      // Create activity log for ticket creation
      await storage.createActivityLog({
        ticketId: newTicket.id,
        userId: newTicket.reportedById,
        action: "created",
        details: { ticket: newTicket },
      });
      
      // Broadcast to WebSocket clients
      broadcastTicketUpdate("create", newTicket);
      
      res.status(201).json(newTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });
  
  // Update ticket
  router.patch("/tickets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ticketData = req.body;
      
      // Get original ticket for activity log
      const originalTicket = await storage.getTicket(id);
      
      if (!originalTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      const updatedTicket = await storage.updateTicket(id, ticketData);
      
      if (!updatedTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Create activity log for ticket update
      await storage.createActivityLog({
        ticketId: updatedTicket.id,
        userId: ticketData.updatedById || updatedTicket.reportedById,
        action: "updated",
        details: { 
          before: originalTicket,
          after: updatedTicket,
          changes: getChanges(originalTicket, updatedTicket)
        },
      });
      
      // Broadcast to WebSocket clients
      broadcastTicketUpdate("update", updatedTicket);
      
      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });
  
  // Get ticket comments
  router.get("/tickets/:id/comments", async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const comments = await storage.getTicketComments(ticketId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  
  // Add comment to ticket
  router.post("/tickets/:id/comments", async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      // Check if ticket exists
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        ticketId,
      });
      
      const newComment = await storage.createComment(commentData);
      
      // Create activity log for comment
      await storage.createActivityLog({
        ticketId: ticketId,
        userId: commentData.userId,
        action: "commented",
        details: { comment: newComment.content },
      });
      
      // Broadcast to WebSocket clients
      broadcastCommentUpdate("create", newComment);
      
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });
  
  // Get ticket activity logs
  router.get("/tickets/:id/activity", async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const activities = await storage.getTicketActivityLogs(ticketId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });
  
  // ===== ATTACHMENTS ENDPOINTS =====
  
  // Add attachment to a ticket
  router.post("/tickets/:id/attachments", async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.body.userId || 1; // Default to first user if not logged in
      
      if (!req.body.files || !Array.isArray(req.body.files) || req.body.files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }
      
      const result = [];
      for (const file of req.body.files) {
        // In a real implementation, you would handle file uploads properly
        // For this demo, we'll just mock the file storage
        const newAttachment = await storage.createAttachment({
          ticketId,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          path: `/uploads/${file.name}`, // This would be a real path in production
          uploadedById: userId
        });
        
        result.push(newAttachment);
        
        // Add activity log for attachment
        await storage.createActivityLog({
          ticketId,
          userId,
          action: "attached_file",
          details: { filename: file.name }
        });
      }
      
      // Broadcast ticket update to WebSocket clients
      const ticket = await storage.getTicket(ticketId);
      if (ticket) {
        broadcastTicketUpdate('update', ticket);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding attachments:", error);
      res.status(500).json({ error: "Failed to add attachments" });
    }
  });
  
  // Get ticket attachments
  router.get("/tickets/:id/attachments", async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const attachments = await storage.getTicketAttachments(ticketId);
      res.json(attachments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attachments" });
    }
  });
  
  // ===== KNOWLEDGE BASE ENDPOINTS =====
  
  // Get all knowledge base articles
  router.get("/kb-articles", async (req: Request, res: Response) => {
    try {
      const onlyPublished = req.query.published === 'true';
      let articles;
      
      if (onlyPublished) {
        articles = await storage.getPublishedKbArticles();
      } else {
        articles = await storage.getAllKbArticles();
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KB articles" });
    }
  });
  
  // Get KB article by ID
  router.get("/kb-articles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKbArticle(id);
      
      if (!article) {
        return res.status(404).json({ error: "KB article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KB article" });
    }
  });
  
  // Register the router with the prefix
  app.use("/api", router);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store reference in global object for access in other functions
  (global as any).wss = wss;
  
  wss.on('connection', (socket) => {
    console.log('WebSocket client connected');
    
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle client messages if needed
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    socket.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  return httpServer;
}

// Helper function to broadcast ticket updates
function broadcastTicketUpdate(action: 'create' | 'update' | 'delete', ticket: any) {
  const wss = getWebSocketServer();
  if (!wss) return;
  
  const message = JSON.stringify({
    type: 'ticket_update',
    action,
    data: ticket
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Helper function to broadcast comment updates
function broadcastCommentUpdate(action: 'create', comment: any) {
  const wss = getWebSocketServer();
  if (!wss) return;
  
  const message = JSON.stringify({
    type: 'comment_update',
    action,
    data: comment
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Helper function to get active WebSocket server
function getWebSocketServer(): WebSocketServer | null {
  // In a real app, you would use proper dependency injection or a global reference
  // For simplicity in this example, we'll use the global wss object
  return (global as any).wss;
}

// Helper function to track changes between original and updated objects
function getChanges(original: any, updated: any): Record<string, { from: any, to: any }> {
  const changes: Record<string, { from: any, to: any }> = {};
  
  Object.keys(updated).forEach(key => {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      changes[key] = {
        from: original[key],
        to: updated[key]
      };
    }
  });
  
  return changes;
}
