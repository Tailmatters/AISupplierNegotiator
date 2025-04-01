import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, jsonb } from "drizzle-orm/pg-core";
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

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  status: text("status").default("active"),
  metadata: json("metadata")
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").notNull().references(() => negotiations.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  proposalId: integer("proposal_id").references(() => proposals.id),
  templateId: integer("template_id").references(() => contractTemplates.id),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  status: text("status").default("draft").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  signedAt: timestamp("signed_at"),
  terms: json("terms"),
  metadata: json("metadata")
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

// Spend data tables for spend analysis functionality
export const spendUploads = pgTable("spend_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  recordCount: integer("record_count").notNull().default(0),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  processingCompletedAt: timestamp("processing_completed_at"),
  source: text("source").notNull().default("csv_upload"), // csv_upload, sap_api, coupa_api, etc.
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
});

export const spendData = pgTable("spend_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(), // Fallback for suppliers not in the system
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  spendAmount: decimal("spend_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  quantity: decimal("quantity", { precision: 15, scale: 2 }),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }),
  itemDescription: text("item_description"),
  departmentId: text("department_id"),
  departmentName: text("department_name"),
  invoiceNumber: text("invoice_number"),
  poNumber: text("po_number"),
  transactionDate: timestamp("transaction_date").notNull(),
  uploadId: integer("upload_id").references(() => spendUploads.id),
  dataSource: text("data_source").notNull().default("csv_upload"), // csv_upload, sap_api, coupa_api, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiConnections = pgTable("api_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // SAP, Coupa, Ariba, etc.
  type: text("type").notNull(), // erp, procurement, etc.
  status: text("status").notNull().default("active"),
  credentials: jsonb("credentials"), // Securely stored API credentials
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: jsonb("metadata"),
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

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  category: true,
  name: true,
  filePath: true,
  fileName: true,
  fileSize: true,
  createdBy: true,
  description: true,
  isDefault: true,
  status: true,
  metadata: true,
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  supplierId: true,
  proposalId: true,
  templateId: true,
  filePath: true,
  fileName: true,
  status: true,
  terms: true,
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

export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type ContractTemplate = typeof contractTemplates.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

// Add schemas for spend analysis tables
export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  fileSize: true,
  fileType: true,
  recordCount: true,
  status: true,
  source: true,
  errorMessage: true,
  metadata: true,
});

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  userId: true,
  supplierId: true,
  supplierName: true,
  category: true,
  subcategory: true,
  spendAmount: true,
  currency: true,
  quantity: true,
  unitPrice: true,
  itemDescription: true,
  departmentId: true,
  departmentName: true,
  invoiceNumber: true,
  poNumber: true,
  transactionDate: true,
  uploadId: true,
  dataSource: true,
});

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  type: true,
  status: true,
  credentials: true,
  metadata: true,
});

export type InsertSpendUpload = z.infer<typeof insertSpendUploadSchema>;
export type SpendUpload = typeof spendUploads.$inferSelect;

export type InsertSpendData = z.infer<typeof insertSpendDataSchema>;
export type SpendData = typeof spendData.$inferSelect;

export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>;
export type ApiConnection = typeof apiConnections.$inferSelect;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  negotiations: many(negotiations),
  spendUploads: many(spendUploads),
  spendData: many(spendData),
  apiConnections: many(apiConnections),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  negotiations: many(negotiations),
  invitations: many(invitations),
  spendData: many(spendData),
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

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
  }),
  contracts: many(contracts)
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
  }),
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
}));

// Relations for spend analysis tables
export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.userId],
    references: [users.id],
  }),
  spendData: many(spendData),
}));

export const spendDataRelations = relations(spendData, ({ one }) => ({
  user: one(users, {
    fields: [spendData.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplierId],
    references: [suppliers.id],
  }),
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
  }),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, {
    fields: [apiConnections.userId],
    references: [users.id],
  }),
}));
