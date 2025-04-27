import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  decimal,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// Enums
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined'])
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'active', 'completed', 'cancelled'])
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'countered'])
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'active', 'expired', 'terminated'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'proposal', 'contract', 'file'])
export const widgetTypeEnum = pgEnum('widget_type', ['spend_summary', 'supplier_chart', 'category_breakdown', 'negotiation_status', 'savings_trend', 'custom'])

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  role: roleEnum('role').default('buyer').notNull(),
  company: varchar('company', { length: 100 }),
  jobTitle: varchar('job_title', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  website: varchar('website', { length: 100 }),
  industry: varchar('industry', { length: 50 }),
  description: text('description'),
  primaryContact: varchar('primary_contact', { length: 100 }),
  primaryContactEmail: varchar('primary_contact_email', { length: 100 }),
  primaryContactPhone: varchar('primary_contact_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  categoryLevel1: varchar('category_level_1', { length: 50 }).notNull(),
  categoryLevel2: varchar('category_level_2', { length: 50 }),
  categoryLevel3: varchar('category_level_3', { length: 50 }),
  description: text('description'),
  initialOffer: decimal('initial_offer', { precision: 12, scale: 2 }),
  targetOffer: decimal('target_offer', { precision: 12, scale: 2 }),
  finalOffer: decimal('final_offer', { precision: 12, scale: 2 }),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  lastActivity: timestamp('last_activity').defaultNow(),
  objectives: text('objectives'),
  pastDataFile: text('past_data_file'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  type: messageTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  sentBy: varchar('sent_by', { length: 20 }).notNull(), // 'user', 'ai', or 'supplier'
  proposalId: integer('proposal_id').references(() => proposals.id),
  contractId: integer('contract_id').references(() => contracts.id),
  filePath: text('file_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  token: varchar('token', { length: 100 }).notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  categoryLevel1: varchar('category_level_1', { length: 50 }).notNull(),
  categoryLevel2: varchar('category_level_2', { length: 50 }),
  categoryLevel3: varchar('category_level_3', { length: 50 }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id),
  name: varchar('name', { length: 100 }).notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  buyerSignedAt: timestamp('buyer_signed_at'),
  supplierSignedAt: timestamp('supplier_signed_at'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  value: decimal('value', { precision: 12, scale: 2 }),
  filePath: text('file_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  proposedBy: varchar('proposed_by', { length: 20 }).notNull(), // 'buyer', 'ai', or 'supplier'
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  offer: decimal('offer', { precision: 12, scale: 2 }).notNull(),
  terms: text('terms'),
  status: proposalStatusEnum('status').default('draft').notNull(),
  responseMessageId: integer('response_message_id').references(() => messages.id),
  filePath: text('file_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  rowCount: integer('row_count'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 100 }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: timestamp('invoice_date'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  categoryLevel1: varchar('category_level_1', { length: 50 }),
  categoryLevel2: varchar('category_level_2', { length: 50 }),
  categoryLevel3: varchar('category_level_3', { length: 50 }),
  department: varchar('department', { length: 100 }),
  location: varchar('location', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g., 'erp', 'crm', 'procurement'
  config: text('config').notNull(), // JSON config string
  lastSyncAt: timestamp('last_sync_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  config: text('config'), // JSON config schema
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  config: text('config'), // JSON config for this specific widget
  position: integer('position').notNull(),
  size: varchar('size', { length: 20 }).default('medium').notNull(), // small, medium, large
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  company: true,
  jobTitle: true,
  phone: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  industry: true,
  description: true,
  primaryContact: true,
  primaryContactEmail: true,
  primaryContactPhone: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  userId: true,
  supplierId: true,
  title: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  description: true,
  initialOffer: true,
  targetOffer: true,
  status: true,
  startDate: true,
  endDate: true,
  objectives: true,
  pastDataFile: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  userId: true,
  type: true,
  content: true,
  sentBy: true,
  proposalId: true,
  contractId: true,
  filePath: true,
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
  userId: true,
  proposedBy: true,
  title: true,
  description: true,
  offer: true,
  terms: true,
  status: true,
  responseMessageId: true,
  filePath: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  userId: true,
  name: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  content: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  templateId: true,
  name: true,
  content: true,
  status: true,
  startDate: true,
  endDate: true,
  value: true,
  filePath: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  originalFileName: true,
  fileSize: true,
  fileType: true,
  rowCount: true,
  startDate: true,
  endDate: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  supplierName: true,
  invoiceNumber: true,
  invoiceDate: true,
  amount: true,
  description: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  department: true,
  location: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  type: true,
  config: true,
  isActive: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  type: true,
  name: true,
  description: true,
  config: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  isDefault: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  name: true,
  config: true,
  position: true,
  size: true,
})

// Types
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  user: one(users, { fields: [suppliers.userId], references: [users.id] }),
  negotiations: many(negotiations),
  spendData: many(spendData),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  user: one(users, { fields: [negotiations.userId], references: [users.id] }),
  supplier: one(suppliers, { fields: [negotiations.supplierId], references: [suppliers.id] }),
  messages: many(messages),
  invitations: many(invitations),
  proposals: many(proposals),
  contracts: many(contracts),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, { fields: [messages.negotiationId], references: [negotiations.id] }),
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  proposal: one(proposals, { fields: [messages.proposalId], references: [proposals.id] }),
  contract: one(contracts, { fields: [messages.contractId], references: [contracts.id] }),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, { fields: [invitations.negotiationId], references: [negotiations.id] }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, { fields: [proposals.negotiationId], references: [negotiations.id] }),
  user: one(users, { fields: [proposals.userId], references: [users.id] }),
  responseMessage: one(messages, { fields: [proposals.responseMessageId], references: [messages.id] }),
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  user: one(users, { fields: [contractTemplates.userId], references: [users.id] }),
  contracts: many(contracts),
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, { fields: [contracts.negotiationId], references: [negotiations.id] }),
  template: one(contractTemplates, { fields: [contracts.templateId], references: [contractTemplates.id] }),
}))

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, { fields: [spendUploads.userId], references: [users.id] }),
  spendData: many(spendData),
}))

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, { fields: [spendData.uploadId], references: [spendUploads.id] }),
  supplier: one(suppliers, { fields: [spendData.supplierId], references: [suppliers.id] }),
}))

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, { fields: [apiConnections.userId], references: [users.id] }),
}))

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, { fields: [dashboards.userId], references: [users.id] }),
  widgets: many(dashboardWidgets),
}))

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, { fields: [dashboardWidgets.dashboardId], references: [dashboards.id] }),
  widgetType: one(widgetTypes, { fields: [dashboardWidgets.widgetTypeId], references: [widgetTypes.id] }),
}))

export const widgetTypesRelations = relations(widgetTypes, ({ many }) => ({
  widgets: many(dashboardWidgets),
}))