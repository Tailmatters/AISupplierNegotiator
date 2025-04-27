import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  decimal, 
  boolean, 
  pgEnum,
  json
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier']);
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined']);
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'active', 'completed', 'cancelled']);
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'countered']);
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'active', 'expired', 'terminated']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'proposal', 'contract', 'file']);
export const widgetTypeEnum = pgEnum('widget_type', ['spend_summary', 'supplier_chart', 'category_breakdown', 'negotiation_status', 'savings_trend', 'custom']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  role: roleEnum('role').notNull().default('buyer'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  website: text('website'),
  address: text('address'),
  notes: text('notes'),
  logoUrl: text('logo_url'),
  primaryContact: varchar('primary_contact', { length: 100 }),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  status: negotiationStatusEnum('status').notNull().default('draft'),
  objectives: json('objectives').default({}),
  initialOffer: decimal('initial_offer', { precision: 12, scale: 2 }),
  finalOffer: decimal('final_offer', { precision: 12, scale: 2 }),
  savingsAmount: decimal('savings_amount', { precision: 12, scale: 2 }),
  savingsPercentage: decimal('savings_percentage', { precision: 5, scale: 2 }),
  pastNegotiationData: text('past_negotiation_data'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  type: messageTypeEnum('type').notNull().default('text'),
  content: text('content').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  isAi: boolean('is_ai').default(false),
  metadata: json('metadata'),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  token: varchar('token', { length: 100 }).notNull().unique(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
});

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  signedByBuyer: boolean('signed_by_buyer').default(false),
  signedBySupplier: boolean('signed_by_supplier').default(false),
  effectiveDate: timestamp('effective_date'),
  expiryDate: timestamp('expiry_date'),
});

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  status: proposalStatusEnum('status').notNull().default('draft'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  terms: json('terms'),
  isAiGenerated: boolean('is_ai_generated').default(false),
  attachmentUrl: text('attachment_url'),
});

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  rowCount: integer('row_count'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  processingStartedAt: timestamp('processing_started_at'),
  processingCompletedAt: timestamp('processing_completed_at'),
  errorMessage: text('error_message'),
});

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  categoryLevel1: varchar('category_level1', { length: 100 }),
  categoryLevel2: varchar('category_level2', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  invoiceNumber: varchar('invoice_number', { length: 50 }),
  poNumber: varchar('po_number', { length: 50 }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  date: timestamp('date').notNull(),
  paymentTerms: varchar('payment_terms', { length: 50 }),
  notes: text('notes'),
});

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  apiKey: text('api_key'),
  credentials: json('credentials'),
  status: varchar('status', { length: 20 }).notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  defaultConfig: json('default_config').default({}),
  isCustom: boolean('is_custom').default(false),
});

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  layout: json('layout').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  config: json('config').default({}),
  position: json('position').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  notes: true,
  logoUrl: true,
  primaryContact: true,
  category: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  userId: true,
  supplierId: true,
  title: true,
  description: true,
  category: true,
  status: true,
  objectives: true,
  initialOffer: true,
  pastNegotiationData: true,
  startDate: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  userId: true,
  supplierId: true,
  type: true,
  content: true,
  isAi: true,
  metadata: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  userId: true,
  supplierId: true,
  amount: true,
  description: true,
  status: true,
  terms: true,
  isAiGenerated: true,
  attachmentUrl: true,
});

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  userId: true,
  name: true,
  content: true,
  category: true,
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  templateId: true,
  title: true,
  content: true,
  status: true,
  effectiveDate: true,
  expiryDate: true,
});

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  status: true,
  rowCount: true,
});

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  supplierName: true,
  description: true,
  category: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  invoiceNumber: true,
  poNumber: true,
  amount: true,
  currency: true,
  date: true,
  paymentTerms: true,
  notes: true,
});

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  provider: true,
  apiKey: true,
  credentials: true,
  status: true,
});

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  type: true,
  name: true,
  description: true,
  defaultConfig: true,
  isCustom: true,
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
  name: true,
  config: true,
  position: true,
});

// Types
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

export type InsertSpendUpload = z.infer<typeof insertSpendUploadSchema>;
export type SpendUpload = typeof spendUploads.$inferSelect;

export type InsertSpendData = z.infer<typeof insertSpendDataSchema>;
export type SpendData = typeof spendData.$inferSelect;

export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>;
export type ApiConnection = typeof apiConnections.$inferSelect;

export type InsertWidgetType = z.infer<typeof insertWidgetTypeSchema>;
export type WidgetType = typeof widgetTypes.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  negotiations: many(negotiations),
  spendData: many(spendData),
}));

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  user: one(users, {
    fields: [negotiations.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
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
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [messages.supplierId],
    references: [suppliers.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  user: one(users, {
    fields: [proposals.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [proposals.supplierId],
    references: [suppliers.id],
  }),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [contractTemplates.userId],
    references: [users.id],
  }),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
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
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplierId],
    references: [suppliers.id],
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