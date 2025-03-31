import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  contactPerson: text("contact_person"),
  category: text("category").notNull(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  objectives: text("objectives").notNull(),
  supplierId: integer("supplier_id").notNull(),
  status: text("status").default("pending"), // pending, active, completed, cancelled
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  pastDataFilePath: text("past_data_file_path"), // File path to uploaded past negotiation data
  messageCount: integer("message_count").default(0),
  outcome: text("outcome"), // Success, failure, etc.
  savingsPercentage: integer("savings_percentage"), // Percentage savings achieved
  createdBy: integer("created_by").notNull(), // User ID who created the negotiation
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").notNull(),
  senderId: text("sender_id").notNull(), // Can be user ID, supplier ID, or "ai"
  senderType: text("sender_type").notNull(), // "user", "supplier", "ai", or "system"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata"), // Any additional data
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").notNull(),
  supplierId: integer("supplier_id").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  contactPerson: true,
  category: true,
  status: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  category: true,
  objectives: true,
  supplierId: true,
  status: true,
  pastDataFilePath: true,
  createdBy: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  senderType: true,
  content: true,
  metadata: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  supplierId: true,
  email: true,
  token: true,
  status: true,
});

// Types for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type Negotiation = typeof negotiations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;
