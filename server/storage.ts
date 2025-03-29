import { 
  User, InsertUser, 
  Ticket, InsertTicket, 
  Comment, InsertComment, 
  Attachment, InsertAttachment,
  ActivityLog, InsertActivityLog,
  KbArticle, InsertKbArticle,
  TicketStatusEnum, TicketPriorityEnum
} from "@shared/schema";

// Define the interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, data: Partial<InsertTicket>): Promise<Ticket | undefined>;
  getAllTickets(): Promise<Ticket[]>;
  getTicketsByStatus(status: string): Promise<Ticket[]>;
  getTicketsByAssignee(userId: number): Promise<Ticket[]>;
  getTicketsByReporter(userId: number): Promise<Ticket[]>;
  getTicketsByPriority(priority: string): Promise<Ticket[]>;
  getRecentTickets(limit: number): Promise<Ticket[]>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  getTicketComments(ticketId: number): Promise<Comment[]>;
  
  // Attachment operations
  getAttachment(id: number): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getTicketAttachments(ticketId: number): Promise<Attachment[]>;
  
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getTicketActivityLogs(ticketId: number): Promise<ActivityLog[]>;
  
  // Knowledge base operations
  getKbArticle(id: number): Promise<KbArticle | undefined>;
  createKbArticle(article: InsertKbArticle): Promise<KbArticle>;
  updateKbArticle(id: number, data: Partial<InsertKbArticle>): Promise<KbArticle | undefined>;
  getAllKbArticles(): Promise<KbArticle[]>;
  getPublishedKbArticles(): Promise<KbArticle[]>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getTeamPerformanceMetrics(): Promise<TeamPerformanceMetric[]>;
  getTicketStatusBreakdown(): Promise<StatusBreakdown[]>;
  getTicketPriorityDistribution(): Promise<PriorityDistribution[]>;
}

// Types for dashboard metrics
export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  closedToday: number;
  averageResponseTime: number;
  totalTrend: { count: number; trend: 'up' | 'down' };
  openTrend: { count: number; trend: 'up' | 'down' };
  closedTrend: { count: number; trend: 'up' | 'down' };
  responseTrend: { hours: number; trend: 'up' | 'down' };
}

export interface TeamPerformanceMetric {
  userId: number;
  userName: string;
  userRole: string;
  avatarUrl: string | null;
  assigned: number;
  resolved: number;
  averageResponseTime: number;
  satisfaction: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private comments: Map<number, Comment>;
  private attachments: Map<number, Attachment>;
  private activityLogs: Map<number, ActivityLog>;
  private kbArticles: Map<number, KbArticle>;
  
  private currentUserId: number;
  private currentTicketId: number;
  private currentCommentId: number;
  private currentAttachmentId: number;
  private currentActivityLogId: number;
  private currentKbArticleId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.comments = new Map();
    this.attachments = new Map();
    this.activityLogs = new Map();
    this.kbArticles = new Map();
    
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentCommentId = 1;
    this.currentAttachmentId = 1;
    this.currentActivityLogId = 1;
    this.currentKbArticleId = 1;
    
    // Seed some initial data
    this.seedInitialData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }
  
  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(
      (ticket) => ticket.ticketNumber === ticketNumber,
    );
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentTicketId++;
    const ticketNumber = `TKT-${id.toString().padStart(4, '0')}`;
    const now = new Date();
    
    const ticket: Ticket = {
      ...insertTicket,
      id,
      ticketNumber,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      closedAt: null,
    };
    
    this.tickets.set(id, ticket);
    return ticket;
  }
  
  async updateTicket(id: number, data: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { 
      ...ticket, 
      ...data,
      updatedAt: new Date()
    };
    
    // Handle status changes to set resolved/closed dates
    if (data.status === 'resolved' && ticket.status !== 'resolved') {
      updatedTicket.resolvedAt = new Date();
    }
    
    if (data.status === 'closed' && ticket.status !== 'closed') {
      updatedTicket.closedAt = new Date();
    }
    
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }
  
  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.status === status,
    );
  }
  
  async getTicketsByAssignee(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.assignedToId === userId,
    );
  }
  
  async getTicketsByReporter(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.reportedById === userId,
    );
  }
  
  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.priority === priority,
    );
  }
  
  async getRecentTickets(limit: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: now,
    };
    
    this.comments.set(id, comment);
    return comment;
  }
  
  async getTicketComments(ticketId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Attachment operations
  async getAttachment(id: number): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }
  
  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const id = this.currentAttachmentId++;
    const now = new Date();
    
    const attachment: Attachment = {
      ...insertAttachment,
      id,
      createdAt: now,
    };
    
    this.attachments.set(id, attachment);
    return attachment;
  }
  
  async getTicketAttachments(ticketId: number): Promise<Attachment[]> {
    return Array.from(this.attachments.values())
      .filter((attachment) => attachment.ticketId === ticketId);
  }

  // Activity log operations
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const now = new Date();
    
    const log: ActivityLog = {
      ...insertLog,
      id,
      createdAt: now,
    };
    
    this.activityLogs.set(id, log);
    return log;
  }
  
  async getTicketActivityLogs(ticketId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.ticketId === ticketId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Knowledge base operations
  async getKbArticle(id: number): Promise<KbArticle | undefined> {
    return this.kbArticles.get(id);
  }
  
  async createKbArticle(insertArticle: InsertKbArticle): Promise<KbArticle> {
    const id = this.currentKbArticleId++;
    const now = new Date();
    
    const article: KbArticle = {
      ...insertArticle,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.kbArticles.set(id, article);
    return article;
  }
  
  async updateKbArticle(id: number, data: Partial<InsertKbArticle>): Promise<KbArticle | undefined> {
    const article = this.kbArticles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { 
      ...article, 
      ...data,
      updatedAt: new Date()
    };
    
    this.kbArticles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async getAllKbArticles(): Promise<KbArticle[]> {
    return Array.from(this.kbArticles.values());
  }
  
  async getPublishedKbArticles(): Promise<KbArticle[]> {
    return Array.from(this.kbArticles.values())
      .filter((article) => article.isPublished);
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allTickets = Array.from(this.tickets.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const openTickets = allTickets.filter(t => t.status === 'open').length;
    const closedToday = allTickets.filter(t => 
      t.status === 'closed' && 
      t.closedAt && 
      t.closedAt >= today
    ).length;
    
    // Calculate response time (simplified for this implementation)
    let totalResponseTime = 0;
    let respondedTickets = 0;
    
    allTickets.forEach(ticket => {
      if (ticket.createdAt && (ticket.status !== 'open')) {
        // Simulate response time using the updated time
        const responseTime = (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60); // in hours
        totalResponseTime += responseTime;
        respondedTickets++;
      }
    });
    
    const averageResponseTime = respondedTickets > 0 
      ? +(totalResponseTime / respondedTickets).toFixed(1) 
      : 0;
    
    return {
      totalTickets: allTickets.length,
      openTickets,
      closedToday,
      averageResponseTime,
      // Sample trends - in a real application these would be calculated from historical data
      totalTrend: { count: 12, trend: 'up' },
      openTrend: { count: 5, trend: 'down' },
      closedTrend: { count: 3, trend: 'up' },
      responseTrend: { hours: 0.5, trend: 'down' },
    };
  }
  
  async getTeamPerformanceMetrics(): Promise<TeamPerformanceMetric[]> {
    const users = Array.from(this.users.values());
    const tickets = Array.from(this.tickets.values());
    
    return users
      .filter(user => user.role === 'agent')
      .map(user => {
        const assignedTickets = tickets.filter(t => t.assignedToId === user.id);
        const resolvedTickets = assignedTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
        
        // Calculate average response time
        let totalResponseTime = 0;
        let respondedTickets = 0;
        
        assignedTickets.forEach(ticket => {
          if (ticket.createdAt && (ticket.status !== 'open')) {
            const responseTime = (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
            totalResponseTime += responseTime;
            respondedTickets++;
          }
        });
        
        const averageResponseTime = respondedTickets > 0 
          ? +(totalResponseTime / respondedTickets).toFixed(1) 
          : 0;
        
        // Generate random satisfaction score between 90 and 100
        const satisfaction = Math.floor(Math.random() * 11) + 90;
        
        return {
          userId: user.id,
          userName: user.fullName,
          userRole: user.role,
          avatarUrl: user.avatarUrl,
          assigned: assignedTickets.length,
          resolved: resolvedTickets.length,
          averageResponseTime,
          satisfaction,
        };
      });
  }
  
  async getTicketStatusBreakdown(): Promise<StatusBreakdown[]> {
    const allTickets = Array.from(this.tickets.values());
    const total = allTickets.length;
    
    const statusCounts = new Map<string, number>();
    
    // Initialize all statuses to 0
    ['open', 'in_progress', 'pending', 'resolved', 'closed'].forEach(status => {
      statusCounts.set(status, 0);
    });
    
    // Count tickets by status
    allTickets.forEach(ticket => {
      const current = statusCounts.get(ticket.status) || 0;
      statusCounts.set(ticket.status, current + 1);
    });
    
    // Convert to array with percentages
    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }
  
  async getTicketPriorityDistribution(): Promise<PriorityDistribution[]> {
    const allTickets = Array.from(this.tickets.values());
    
    const priorityCounts = new Map<string, number>();
    
    // Initialize all priorities to 0
    ['urgent', 'high', 'medium', 'low'].forEach(priority => {
      priorityCounts.set(priority, 0);
    });
    
    // Count tickets by priority
    allTickets.forEach(ticket => {
      const current = priorityCounts.get(ticket.priority) || 0;
      priorityCounts.set(ticket.priority, current + 1);
    });
    
    // Convert to array
    return Array.from(priorityCounts.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));
  }

  // Seed initial data for testing
  private seedInitialData() {
    // Create users
    const johnSmith: InsertUser = {
      username: 'johnsmith',
      password: 'password123', // In a real app, this would be hashed
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      role: 'agent',
      avatarUrl: null,
      department: 'IT Support',
    };
    this.createUser(johnSmith);
    
    const sarahConnor: InsertUser = {
      username: 'sarahconnor',
      password: 'password123',
      fullName: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      role: 'agent',
      avatarUrl: null,
      department: 'Support',
    };
    this.createUser(sarahConnor);
    
    const davidMiller: InsertUser = {
      username: 'davidmiller',
      password: 'password123',
      fullName: 'David Miller',
      email: 'david.miller@example.com',
      role: 'agent',
      avatarUrl: null,
      department: 'Support',
    };
    this.createUser(davidMiller);
    
    const janeUser: InsertUser = {
      username: 'janeuser',
      password: 'password123',
      fullName: 'Jane User',
      email: 'jane.user@example.com',
      role: 'user',
      avatarUrl: null,
      department: 'Finance',
    };
    this.createUser(janeUser);
    
    // Create tickets
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    const ticket1: InsertTicket = {
      title: 'Cannot access email after password reset',
      description: 'After resetting my password, I can no longer access my email account. I get an "invalid credentials" error even though I am sure I am using the correct password.',
      status: 'open',
      priority: 'high',
      category: 'software',
      subCategory: 'email',
      impact: 'medium',
      urgency: 'high',
      assignedToId: 2, // Sarah Connor
      reportedById: 4, // Jane User
      configurationItem: 'Email System',
      callerLocation: 'Headquarters',
      issueLocation: 'Headquarters',
      preferredContact: 'email',
    };
    
    const createdTicket1 = this.createTicket(ticket1);
    createdTicket1.createdAt = twoHoursAgo;
    createdTicket1.updatedAt = twoHoursAgo;
    this.tickets.set(createdTicket1.id, createdTicket1);
    
    const ticket2: InsertTicket = {
      title: 'VPN connection issues when working remotely',
      description: 'I am having trouble connecting to the VPN when working from home. The connection keeps dropping every few minutes.',
      status: 'in_progress',
      priority: 'medium',
      category: 'network',
      subCategory: 'vpn',
      impact: 'medium',
      urgency: 'medium',
      assignedToId: 1, // John Smith
      reportedById: 4, // Jane User
      configurationItem: 'VPN',
      callerLocation: 'Remote',
      issueLocation: 'Remote',
      preferredContact: 'phone',
    };
    
    const createdTicket2 = this.createTicket(ticket2);
    createdTicket2.createdAt = threeHoursAgo;
    createdTicket2.updatedAt = threeHoursAgo;
    this.tickets.set(createdTicket2.id, createdTicket2);
    
    const ticket3: InsertTicket = {
      title: 'Need access to finance department shared drive',
      description: 'I need access to the finance department shared drive to complete my quarterly report.',
      status: 'pending',
      priority: 'low',
      category: 'access',
      subCategory: 'file_access',
      impact: 'low',
      urgency: 'medium',
      assignedToId: 3, // David Miller
      reportedById: 4, // Jane User
      configurationItem: 'Shared Drive',
      callerLocation: 'Headquarters',
      issueLocation: 'Headquarters',
      preferredContact: 'email',
    };
    
    const createdTicket3 = this.createTicket(ticket3);
    createdTicket3.createdAt = yesterday;
    createdTicket3.updatedAt = yesterday;
    this.tickets.set(createdTicket3.id, createdTicket3);
    
    // Add more tickets to have a meaningful dashboard
    for (let i = 0; i < 20; i++) {
      const statuses = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
      const priorities = ['urgent', 'high', 'medium', 'low'];
      const assignees = [1, 2, 3];
      
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomAssignee = assignees[Math.floor(Math.random() * assignees.length)];
      
      const randomTicket: InsertTicket = {
        title: `Ticket ${i + 4}`,
        description: `This is a random ticket ${i + 4} for testing purposes.`,
        status: randomStatus,
        priority: randomPriority,
        category: 'other',
        subCategory: 'general',
        impact: 'medium',
        urgency: 'medium',
        assignedToId: randomAssignee,
        reportedById: 4, // Jane User
        configurationItem: null,
        callerLocation: null,
        issueLocation: null,
        preferredContact: null,
      };
      
      this.createTicket(randomTicket);
    }
  }
}

export const storage = new MemStorage();
