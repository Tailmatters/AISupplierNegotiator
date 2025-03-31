import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").notNull(),
  supplierId: integer("supplier_id").notNull(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  description: text("description"),
  amount: text("amount"), // Monetary amount (stored as text to handle different currencies)
  status: text("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata"), // Any additional data
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

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  supplierId: true,
  filePath: true,
  fileName: true,
  fileSize: true,
  description: true,
  amount: true,
  status: true,
  metadata: true,
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

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  negotiations: many(negotiations),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  negotiations: many(negotiations),
  invitations: many(invitations),
}));

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  creator: one(users, {
    fields: [negotiations.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
  invitations: many(invitations),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiationId],
    references: [negotiations.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [invitations.supplierId],
    references: [suppliers.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [proposals.supplierId],
    references: [suppliers.id],
  }),
}));
