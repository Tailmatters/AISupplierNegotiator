// This file is migrated from shared/schema.ts
import { pgEnum, pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { text, integer, boolean, jsonb, timestamp, varchar } from 'drizzle-orm/pg-core'
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
  id: integer('id').primaryKey().notNull().default(sql`nextval('users_id_seq')`),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  role: roleEnum('role').default('buyer').notNull(),
  company: text('company'),
  position: text('position'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('suppliers_id_seq')`),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  contactName: text('contact_name'),
  contactPosition: text('contact_position'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  status: text('status').default('active'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('negotiations_id_seq')`),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  description: text('description'),
  objectives: jsonb('objectives'),
  pastData: jsonb('past_data'),
  analysis: jsonb('analysis'),
  result: jsonb('result'),
  startDate: timestamp('start_date'),
  completionDate: timestamp('completion_date'),
  savingsTarget: integer('savings_target'),
  actualSavings: integer('actual_savings'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('messages_id_seq')`),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
  messageType: messageTypeEnum('message_type').default('text').notNull(),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('invitations_id_seq')`),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  token: text('token').unique().notNull(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('contract_templates_id_seq')`),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  content: text('content').notNull(),
  variables: jsonb('variables'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('contracts_id_seq')`),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'set null' }),
  templateId: integer('template_id').references(() => contractTemplates.id, { onDelete: 'set null' }),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  signedDate: timestamp('signed_date'),
  documentUrl: text('document_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const proposals = pgTable('proposals', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('proposals_id_seq')`),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: proposalStatusEnum('status').default('draft').notNull(),
  value: integer('value'),
  savings: integer('savings'),
  terms: jsonb('terms'),
  feedback: text('feedback'),
  documentUrl: text('document_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('spend_uploads_id_seq')`),
  uploadedById: integer('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
  filename: text('filename').notNull(),
  fileUrl: text('file_url'),
  rowCount: integer('row_count'),
  status: text('status').default('processing').notNull(),
  processingErrors: jsonb('processing_errors'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendData = pgTable('spend_data', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('spend_data_id_seq')`),
  uploadId: integer('upload_id').references(() => spendUploads.id, { onDelete: 'set null' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  date: timestamp('date').notNull(),
  invoiceNumber: text('invoice_number'),
  poNumber: text('po_number'),
  description: text('description'),
  category: text('category'),
  subcategory: text('subcategory'),
  categoryLevel3: text('category_level_3'),
  quantity: integer('quantity'),
  unitPrice: integer('unit_price'),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('api_connections_id_seq')`),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  config: jsonb('config').notNull(),
  status: text('status').default('active').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  syncFrequency: text('sync_frequency'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('widget_types_id_seq')`),
  name: text('name').notNull(),
  description: text('description'),
  defaultConfig: jsonb('default_config'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('dashboards_id_seq')`),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  layout: jsonb('layout'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: integer('id').primaryKey().notNull().default(sql`nextval('dashboard_widgets_id_seq')`),
  dashboardId: integer('dashboard_id').references(() => dashboards.id, { onDelete: 'cascade' }).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  config: jsonb('config'),
  position: jsonb('position'),
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
  avatarUrl: true,
  settings: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  createdById: true,
  name: true,
  email: true,
  phone: true,
  website: true,
  contactName: true,
  contactPosition: true,
  contactEmail: true,
  contactPhone: true,
  status: true,
  notes: true,
  metadata: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  createdById: true,
  supplierId: true,
  title: true,
  category: true,
  subcategory: true,
  status: true,
  description: true,
  objectives: true,
  pastData: true,
  analysis: true,
  result: true,
  startDate: true,
  completionDate: true,
  savingsTarget: true,
  actualSavings: true,
  metadata: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  messageType: true,
  content: true,
  attachmentUrl: true,
  metadata: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  createdById: true,
  name: true,
  description: true,
  category: true,
  content: true,
  variables: true,
  isActive: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  templateId: true,
  createdById: true,
  supplierId: true,
  title: true,
  content: true,
  status: true,
  startDate: true,
  endDate: true,
  signedDate: true,
  documentUrl: true,
  metadata: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  createdById: true,
  title: true,
  content: true,
  status: true,
  value: true,
  savings: true,
  terms: true,
  feedback: true,
  documentUrl: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  uploadedById: true,
  filename: true,
  fileUrl: true,
  rowCount: true,
  status: true,
  processingErrors: true,
  metadata: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  date: true,
  invoiceNumber: true,
  poNumber: true,
  description: true,
  category: true,
  subcategory: true,
  categoryLevel3: true,
  quantity: true,
  unitPrice: true,
  amount: true,
  currency: true,
  metadata: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  createdById: true,
  name: true,
  type: true,
  config: true,
  status: true,
  lastSyncAt: true,
  syncFrequency: true,
  metadata: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  defaultConfig: true,
  isActive: true,
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

export type ContractTemplate = typeof contractTemplates.$inferSelect
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>

export type Contract = typeof contracts.$inferSelect
export type InsertContract = z.infer<typeof insertContractSchema>

export type Proposal = typeof proposals.$inferSelect
export type InsertProposal = z.infer<typeof insertProposalSchema>

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
  contracts: many(contracts),
  proposals: many(proposals),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  createdBy: one(users, {
    fields: [suppliers.createdById],
    references: [users.id],
  }),
  negotiations: many(negotiations),
  contracts: many(contracts),
  spendData: many(spendData),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [negotiations.createdById],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  messages: many(messages),
  invitations: many(invitations),
  contracts: many(contracts),
  proposals: many(proposals),
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
  createdBy: one(users, {
    fields: [contracts.createdById],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
  }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  createdBy: one(users, {
    fields: [proposals.createdById],
    references: [users.id],
  }),
}))

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [spendUploads.uploadedById],
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
  createdBy: one(users, {
    fields: [apiConnections.createdById],
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