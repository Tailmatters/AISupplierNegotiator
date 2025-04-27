import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
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
  status: text("status").default("pending"), // pending, active, completed, cancelled, pending_further
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  pastDataFilePath: text("past_data_file_path"), // File path to uploaded past negotiation data
  messageCount: integer("message_count").default(0),
  outcome: text("outcome"), // Success, failure, etc.
  savingsPercentage: integer("savings_percentage"), // Percentage savings achieved
  createdBy: integer("created_by").notNull(), // User ID who created the negotiation
  
  // Performance evaluation fields
  initialOffer: decimal("initial_offer", { precision: 15, scale: 2 }), // Initial offer amount
  finalOffer: decimal("final_offer", { precision: 15, scale: 2 }), // Final offer amount
  currency: text("currency").default("USD"), // Currency for the offers
  unit: text("unit"), // Optional unit of measure (e.g., "piece", "kg", etc.)
  rating: integer("rating"), // 1-5 star rating from buyer
  feedback: text("feedback"), // Detailed feedback from buyer
  savingsAmount: decimal("savings_amount", { precision: 15, scale: 2 }), // Absolute amount saved
  concludedAt: timestamp("concluded_at"), // When the negotiation was formally concluded
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
  category: text("category").notNull(), // Level 1 category
  subcategory: text("subcategory"), // Level 2 category
  subcategoryLevel3: text("subcategory_level3"), // Level 3 category
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
  isAutoCategorized: boolean("is_auto_categorized").default(false), // Flag for auto-categorization
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

// Dashboard widgets schema
export const widgetTypes = pgTable("widget_types", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().unique(), // e.g., "spend-by-category", "recent-negotiations", etc.
  name: text("name").notNull(), // Display name
  description: text("description"),
  icon: text("icon"),
  defaultHeight: integer("default_height").notNull().default(2), // Default grid height
  defaultWidth: integer("default_width").notNull().default(2), // Default grid width
  minHeight: integer("min_height").notNull().default(1),
  minWidth: integer("min_width").notNull().default(1),
  maxHeight: integer("max_height"),
  maxWidth: integer("max_width"),
  category: text("category").notNull().default("general"), // Analytics, Operations, etc.
  availableSettings: jsonb("available_settings"), // Available settings for this widget type
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  isDefault: boolean("is_default").default(false),
  layout: jsonb("layout"), // Stores the grid layout
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").notNull().references(() => dashboards.id, { onDelete: "cascade" }),
  widgetTypeId: integer("widget_type_id").notNull().references(() => widgetTypes.id),
  title: text("title"),
  settings: jsonb("settings"), // Widget-specific settings (filters, display options, etc.)
  position: integer("position").notNull().default(0), // Order in the dashboard
  width: integer("width").notNull().default(2), // Grid width
  height: integer("height").notNull().default(2), // Grid height
  x: integer("x").default(0), // Grid x position
  y: integer("y").default(0), // Grid y position
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  initialOffer: true,
  finalOffer: true,
  currency: true,
  unit: true,
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
  subcategoryLevel3: true,
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
  isAutoCategorized: true,
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

// Dashboard widget schemas
export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  type: true,
  name: true,
  description: true,
  icon: true,
  defaultHeight: true,
  defaultWidth: true,
  minHeight: true,
  minWidth: true,
  maxHeight: true,
  maxWidth: true,
  category: true,
  availableSettings: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  isDefault: true,
  layout: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  settings: true,
  position: true,
  width: true,
  height: true,
  x: true,
  y: true,
});

export type InsertWidgetType = z.infer<typeof insertWidgetTypeSchema>;
export type WidgetType = typeof widgetTypes.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  negotiations: many(negotiations),
  spendUploads: many(spendUploads),
  spendData: many(spendData),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
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
  createdByUser: one(users, {
    fields: [negotiations.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
  invitations: many(invitations),
  proposals: many(proposals),
  contracts: many(contracts),
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

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [proposals.supplierId],
    references: [suppliers.id],
  }),
  contracts: many(contracts),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
  }),
  contracts: many(contracts),
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

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
  widgets: many(dashboardWidgets),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widgetTypeId],
    references: [widgetTypes.id],
  }),
}));