import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  pgEnum,
  boolean,
  json,
  numeric,
  date,
  decimal,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// Enum definitions
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined'])
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'active', 'completed', 'cancelled'])
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'countered'])
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'active', 'expired', 'terminated'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'proposal', 'contract', 'file'])
export const widgetTypeEnum = pgEnum('widget_type', ['spend_summary', 'supplier_chart', 'category_breakdown', 'negotiation_status', 'savings_trend', 'custom'])

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('buyer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contactName: varchar('contact_name', { length: 100 }),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  category: varchar('category', { length: 100 }),
  notes: text('notes'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Negotiations table
export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  categoryLevel1: varchar('category_level1', { length: 100 }).notNull(),
  categoryLevel2: varchar('category_level2', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  objectives: text('objectives'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdById: integer('created_by_id').references(() => users.id),
  aiPerformanceRating: integer('ai_performance_rating'),
  aiPerformanceFeedback: text('ai_performance_feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Messages table for negotiation chat
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  content: text('content').notNull(),
  messageType: messageTypeEnum('message_type').default('text').notNull(),
  attachmentUrl: text('attachment_url'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
})

// Supplier invitations
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  token: varchar('token', { length: 100 }).notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at').notNull(),
})

// Contract templates
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  content: text('content').notNull(),
  categoryLevel1: varchar('category_level1', { length: 100 }),
  categoryLevel2: varchar('category_level2', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Contracts
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  signedByBuyerId: integer('signed_by_buyer_id').references(() => users.id),
  signedBySupplierId: integer('signed_by_supplier_id').references(() => users.id),
  buyerSignedAt: timestamp('buyer_signed_at'),
  supplierSignedAt: timestamp('supplier_signed_at'),
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Proposals
export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  content: text('content').notNull(),
  status: proposalStatusEnum('status').default('draft').notNull(),
  sentAt: timestamp('sent_at'),
  respondedAt: timestamp('responded_at'),
  attachmentUrl: text('attachment_url'),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Spend uploads
export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  recordCount: integer('record_count'),
  status: varchar('status', { length: 50 }).default('processing').notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Spend data
export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: date('invoice_date'),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  description: text('description'),
  categoryLevel1: varchar('category_level1', { length: 100 }),
  categoryLevel2: varchar('category_level2', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  poNumber: varchar('po_number', { length: 100 }),
  department: varchar('department', { length: 100 }),
  costCenter: varchar('cost_center', { length: 100 }),
  year: integer('year'),
  month: integer('month'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// API Connections for external procurement systems
export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  config: json('config').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Widget types
export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  defaultConfig: json('default_config').notNull(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Dashboards
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  layout: json('layout'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Dashboard widgets
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  config: json('config').notNull(),
  position: integer('position').notNull(),
  size: varchar('size', { length: 20 }).default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  email: true,
  password: true,
  role: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contactName: true,
  email: true,
  phone: true,
  address: true,
  category: true,
  notes: true,
  createdById: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  supplierId: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  status: true,
  objectives: true,
  startDate: true,
  endDate: true,
  createdById: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  content: true,
  messageType: true,
  attachmentUrl: true,
  isAiGenerated: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  senderId: true,
  content: true,
  status: true,
  attachmentUrl: true,
  isAiGenerated: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  content: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  createdById: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  templateId: true,
  content: true,
  status: true,
  effectiveDate: true,
  expirationDate: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  filename: true,
  originalFilename: true,
  fileSize: true,
  status: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  supplierName: true,
  invoiceNumber: true,
  invoiceDate: true,
  amount: true,
  currency: true,
  description: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  poNumber: true,
  department: true,
  costCenter: true,
  year: true,
  month: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  type: true,
  config: true,
  isActive: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  defaultConfig: true,
  icon: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  isDefault: true,
  layout: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  config: true,
  position: true,
  size: true,
})

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>
export type User = typeof users.$inferSelect

export type InsertSupplier = z.infer<typeof insertSupplierSchema>
export type Supplier = typeof suppliers.$inferSelect

export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>
export type Negotiation = typeof negotiations.$inferSelect

export type InsertMessage = z.infer<typeof insertMessageSchema>
export type Message = typeof messages.$inferSelect

export type InsertInvitation = z.infer<typeof insertInvitationSchema>
export type Invitation = typeof invitations.$inferSelect

export type InsertProposal = z.infer<typeof insertProposalSchema>
export type Proposal = typeof proposals.$inferSelect

export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>
export type ContractTemplate = typeof contractTemplates.$inferSelect

export type InsertContract = z.infer<typeof insertContractSchema>
export type Contract = typeof contracts.$inferSelect

export type InsertSpendUpload = z.infer<typeof insertSpendUploadSchema>
export type SpendUpload = typeof spendUploads.$inferSelect

export type InsertSpendData = z.infer<typeof insertSpendDataSchema>
export type SpendData = typeof spendData.$inferSelect

export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>
export type ApiConnection = typeof apiConnections.$inferSelect

export type InsertWidgetType = z.infer<typeof insertWidgetTypeSchema>
export type WidgetType = typeof widgetTypes.$inferSelect

export type InsertDashboard = z.infer<typeof insertDashboardSchema>
export type Dashboard = typeof dashboards.$inferSelect

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>
export type DashboardWidget = typeof dashboardWidgets.$inferSelect

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  dashboards: many(dashboards),
  apiConnections: many(apiConnections),
  spendUploads: many(spendUploads),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations),
  spendData: many(spendData),
  createdBy: one(users, {
    fields: [suppliers.createdById],
    references: [users.id],
  }),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [negotiations.createdById],
    references: [users.id],
  }),
  messages: many(messages),
  invitations: many(invitations),
  proposals: many(proposals),
  contracts: many(contracts),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiationId],
    references: [negotiations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
  }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  sender: one(users, {
    fields: [proposals.senderId],
    references: [users.id],
  }),
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [contractTemplates.createdById],
    references: [users.id],
  }),
  contracts: many(contracts),
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
  signedByBuyer: one(users, {
    fields: [contracts.signedByBuyerId],
    references: [users.id],
  }),
  signedBySupplier: one(users, {
    fields: [contracts.signedBySupplierId],
    references: [users.id],
  }),
}))

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.userId],
    references: [users.id],
  }),
  spendData: many(spendData),
}))

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplierId],
    references: [suppliers.id],
  }),
}))

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, {
    fields: [apiConnections.userId],
    references: [users.id],
  }),
}))

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
  widgets: many(dashboardWidgets),
}))

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widgetTypeId],
    references: [widgetTypes.id],
  }),
}))

export const widgetTypesRelations = relations(widgetTypes, ({ many }) => ({
  dashboardWidgets: many(dashboardWidgets),
}))