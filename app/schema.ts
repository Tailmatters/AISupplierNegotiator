import { relations } from 'drizzle-orm'
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
  jsonb,
  date,
  numeric,
} from 'drizzle-orm/pg-core'
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
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 100 }),
  role: roleEnum('role').notNull().default('buyer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contactName: varchar('contact_name', { length: 100 }),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  category: varchar('category', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  status: negotiationStatusEnum('status').notNull().default('draft'),
  category: varchar('category', { length: 50 }),
  categoryLevel1: varchar('category_level1', { length: 50 }),
  categoryLevel2: varchar('category_level2', { length: 50 }),
  categoryLevel3: varchar('category_level3', { length: 50 }),
  objectives: jsonb('objectives'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  type: messageTypeEnum('type').notNull().default('text'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
  isAiGenerated: boolean('is_ai_generated').default(false),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').notNull().default('draft'),
  signedUrl: text('signed_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'set null' }),
  templateId: integer('template_id').references(() => contractTemplates.id, { onDelete: 'set null' }),
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content'),
  status: proposalStatusEnum('status').notNull().default('draft'),
  attachmentUrl: text('attachment_url'),
  offerDetails: jsonb('offer_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  sourceName: varchar('source_name', { length: 100 }),
  totalRecords: integer('total_records'),
  status: varchar('status', { length: 20 }).notNull().default('processing'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  transactionDate: date('transaction_date'),
  supplierName: varchar('supplier_name', { length: 100 }),
  description: text('description'),
  amount: numeric('amount'),
  currency: varchar('currency', { length: 3 }),
  category: varchar('category', { length: 50 }),
  categoryLevel1: varchar('category_level1', { length: 50 }),
  categoryLevel2: varchar('category_level2', { length: 50 }),
  categoryLevel3: varchar('category_level3', { length: 50 }),
  uploadId: integer('upload_id').references(() => spendUploads.id, { onDelete: 'cascade' }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  config: jsonb('config').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  layout: jsonb('layout'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  config: jsonb('config'),
  size: varchar('size', { length: 20 }).default('medium'),
  position: integer('position').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id, { onDelete: 'cascade' }).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id, { onDelete: 'cascade' }).notNull(),
})

// Schemas and Types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
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
  userId: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  status: true,
  category: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  objectives: true,
  startDate: true,
  endDate: true,
  userId: true,
  supplierId: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  type: true,
  attachmentUrl: true,
  negotiationId: true,
  senderId: true,
  isAiGenerated: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  token: true,
  email: true,
  status: true,
  expiresAt: true,
  negotiationId: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  title: true,
  content: true,
  status: true,
  attachmentUrl: true,
  offerDetails: true,
  negotiationId: true,
  senderId: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  content: true,
  category: true,
  userId: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  content: true,
  status: true,
  signedUrl: true,
  negotiationId: true,
  templateId: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  filename: true,
  sourceName: true,
  totalRecords: true,
  status: true,
  userId: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  transactionDate: true,
  supplierName: true,
  description: true,
  amount: true,
  currency: true,
  category: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  uploadId: true,
  supplierId: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  name: true,
  type: true,
  config: true,
  lastSyncAt: true,
  userId: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  config: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  description: true,
  isDefault: true,
  layout: true,
  userId: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  title: true,
  config: true,
  size: true,
  position: true,
  dashboardId: true,
  widgetTypeId: true,
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
  messages: many(messages),
  contractTemplates: many(contractTemplates),
  dashboards: many(dashboards),
  apiConnections: many(apiConnections),
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
  sender: one(users, {
    fields: [proposals.senderId],
    references: [users.id],
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
  dashboardWidgets: many(dashboardWidgets),
}))