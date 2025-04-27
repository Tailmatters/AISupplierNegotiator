import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgEnum,
  boolean,
  integer,
  date,
  jsonb,
  numeric,
  unique,
  primaryKey,
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
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('buyer'),
  company: varchar('company', { length: 255 }),
  position: varchar('position', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true).notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  website: varchar('website', { length: 255 }),
  category: varchar('category', { length: 255 }),
  subCategory: varchar('sub_category', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 255 }).notNull(),
  subCategory: varchar('sub_category', { length: 255 }),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  objectives: jsonb('objectives'),
  pastDataFile: varchar('past_data_file', { length: 255 }),
  analysis: jsonb('analysis'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  currentAmount: numeric('current_amount'),
  targetAmount: numeric('target_amount'),
  finalAmount: numeric('final_amount'),
  savingsPercentage: numeric('savings_percentage'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  fileUrl: varchar('file_url', { length: 255 }),
  metadata: jsonb('metadata'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  subCategory: varchar('sub_category', { length: 255 }),
  content: text('content').notNull(),
  variables: jsonb('variables'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'set null' }),
  templateId: integer('template_id').references(() => contractTemplates.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  signedByBuyer: boolean('signed_by_buyer').default(false).notNull(),
  signedBySeller: boolean('signed_by_seller').default(false).notNull(),
  buyerSignedAt: timestamp('buyer_signed_at'),
  sellerSignedAt: timestamp('seller_signed_at'),
  fileUrl: varchar('file_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  messageId: integer('message_id').references(() => messages.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: jsonb('content').notNull(),
  amount: numeric('amount'),
  status: proposalStatusEnum('status').default('draft').notNull(),
  fileUrl: varchar('file_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  mimetype: varchar('mimetype', { length: 100 }).notNull(),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending').notNull(),
  errorMessage: text('error_message'),
  rowCount: integer('row_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id, { onDelete: 'cascade' }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: date('invoice_date'),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  description: text('description'),
  category: varchar('category', { length: 255 }),
  subCategory: varchar('sub_category', { length: 255 }),
  categoryLevel1: varchar('category_level1', { length: 255 }),
  categoryLevel2: varchar('category_level2', { length: 255 }),
  categoryLevel3: varchar('category_level3', { length: 255 }),
  departmentId: varchar('department_id', { length: 100 }),
  departmentName: varchar('department_name', { length: 255 }),
  year: integer('year'),
  month: integer('month'),
  quarter: integer('quarter'),
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(),
  apiKey: varchar('api_key', { length: 1000 }),
  apiSecret: varchar('api_secret', { length: 1000 }),
  config: jsonb('config'),
  lastSync: timestamp('last_sync'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  defaultConfig: jsonb('default_config'),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  layout: jsonb('layout'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id, { onDelete: 'cascade' }).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  config: jsonb('config'),
  position: integer('position').notNull(),
  size: varchar('size', { length: 50 }).default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  role: true,
  company: true,
  position: true,
  phone: true,
  isActive: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  category: true,
  subCategory: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  notes: true,
  isActive: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  userId: true,
  supplierId: true,
  title: true,
  description: true,
  category: true,
  subCategory: true,
  status: true,
  objectives: true,
  pastDataFile: true,
  analysis: true,
  startDate: true,
  endDate: true,
  currentAmount: true,
  targetAmount: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  content: true,
  type: true,
  fileUrl: true,
  metadata: true,
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
  messageId: true,
  title: true,
  description: true,
  content: true,
  amount: true,
  status: true,
  fileUrl: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  userId: true,
  name: true,
  category: true,
  subCategory: true,
  content: true,
  variables: true,
  isDefault: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  templateId: true,
  title: true,
  content: true,
  status: true,
  startDate: true,
  endDate: true,
  signedByBuyer: true,
  signedBySeller: true,
  fileUrl: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  filename: true,
  originalFilename: true,
  size: true,
  mimetype: true,
  processingStatus: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  invoiceNumber: true,
  invoiceDate: true,
  amount: true,
  currency: true,
  description: true,
  category: true,
  subCategory: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  departmentId: true,
  departmentName: true,
  year: true,
  month: true,
  quarter: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  provider: true,
  apiKey: true,
  apiSecret: true,
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
  description: true,
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

// Types
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>

export type Supplier = typeof suppliers.$inferSelect
export type InsertSupplier = z.infer<typeof insertSupplierSchema>

export type Negotiation = typeof negotiations.$inferSelect
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>

export type Message = typeof messages.$inferSelect
export type InsertMessage = z.infer<typeof insertMessageSchema>

export type Invitation = typeof invitations.$inferSelect
export type InsertInvitation = z.infer<typeof insertInvitationSchema>

export type Proposal = typeof proposals.$inferSelect
export type InsertProposal = z.infer<typeof insertProposalSchema>

export type ContractTemplate = typeof contractTemplates.$inferSelect
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>

export type Contract = typeof contracts.$inferSelect
export type InsertContract = z.infer<typeof insertContractSchema>

export type SpendUpload = typeof spendUploads.$inferSelect
export type InsertSpendUpload = z.infer<typeof insertSpendUploadSchema>

export type SpendData = typeof spendData.$inferSelect
export type InsertSpendData = z.infer<typeof insertSpendDataSchema>

export type ApiConnection = typeof apiConnections.$inferSelect
export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>

export type WidgetType = typeof widgetTypes.$inferSelect
export type InsertWidgetType = z.infer<typeof insertWidgetTypeSchema>

export type Dashboard = typeof dashboards.$inferSelect
export type InsertDashboard = z.infer<typeof insertDashboardSchema>

export type DashboardWidget = typeof dashboardWidgets.$inferSelect
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id],
  }),
  negotiations: many(negotiations),
  spendData: many(spendData),
}))

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
  user: one(users, {
    fields: [proposals.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [proposals.messageId],
    references: [messages.id],
  }),
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [contractTemplates.userId],
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
  widgets: many(dashboardWidgets),
}))