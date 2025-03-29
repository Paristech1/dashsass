import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  avatarUrl: text("avatar_url"),
  department: text("department"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Ticket model
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  category: text("category"),
  subCategory: text("sub_category"),
  impact: text("impact"),
  urgency: text("urgency"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  reportedById: integer("reported_by_id").notNull().references(() => users.id),
  configurationItem: text("configuration_item"),
  callerLocation: text("caller_location"),
  issueLocation: text("issue_location"),
  preferredContact: text("preferred_contact"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  closedAt: true,
});

// Comment model for ticket thread
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isInternal: boolean("is_internal").notNull().default(false),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Attachment model for ticket attachments
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  path: text("path").notNull(),
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

// Activity Log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Knowledge Base Articles
export const kbArticles = pgTable("kb_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id"),
  authorId: integer("author_id").notNull().references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKbArticleSchema = createInsertSchema(kbArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type KbArticle = typeof kbArticles.$inferSelect;
export type InsertKbArticle = z.infer<typeof insertKbArticleSchema>;

// Enum types
export const TicketStatusEnum = z.enum([
  "open",
  "in_progress",
  "pending",
  "resolved",
  "closed"
]);

export const TicketPriorityEnum = z.enum([
  "urgent",
  "high",
  "medium",
  "low"
]);

export const ImpactEnum = z.enum([
  "high",
  "medium",
  "low"
]);

export const UrgencyEnum = z.enum([
  "high",
  "medium",
  "low"
]);

export const UserRoleEnum = z.enum([
  "admin",
  "agent",
  "user"
]);

export type TicketStatus = z.infer<typeof TicketStatusEnum>;
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;
export type Impact = z.infer<typeof ImpactEnum>;
export type Urgency = z.infer<typeof UrgencyEnum>;
export type UserRole = z.infer<typeof UserRoleEnum>;
