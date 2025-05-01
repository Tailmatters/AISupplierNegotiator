import { pgTable, pgEnum, serial, text, varchar, timestamp, boolean, json, integer, uuid, unique } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { relations } from "drizzle-orm"
import { z } from "zod"

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
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: roleEnum('role').default('buyer').notNull(),
  avatar: text('avatar'),
  company: varchar('company', { length: 100 }),
  title: varchar('title', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true).notNull(),
  preferences: json('preferences')
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(), 
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  website: text('website'),
  primaryContact: varchar('primary_contact', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  description: text('description'),
  logo: text('logo'),
  tier: varchar('tier', { length: 50 }),
  industry: varchar('industry', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: json('metadata')
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  objectives: json('objectives'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  budget: integer('budget'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  result: json('result'),
  metadata: json('metadata')
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  type: messageTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  isAi: boolean('is_ai').default(false).notNull(),
  metadata: json('metadata'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  token: uuid('token').notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  metadata: json('metadata')
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  variables: json('variables'),
  metadata: json('metadata')
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id),
  status: contractStatusEnum('status').default('draft').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  value: integer('value'),
  signerName: varchar('signer_name', { length: 100 }),
  signerTitle: varchar('signer_title', { length: 100 }),
  signerEmail: varchar('signer_email', { length: 255 }),
  metadata: json('metadata')
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  userId: integer('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: proposalStatusEnum('status').default('draft').notNull(),
  terms: json('terms'),
  value: integer('value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  attachmentUrl: text('attachment_url'),
  metadata: json('metadata')
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  uploadDate: timestamp('upload_date').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  recordCount: integer('record_count'),
  mappingConfig: json('mapping_config'),
  processedAt: timestamp('processed_at'),
  errorLog: text('error_log'),
  metadata: json('metadata')
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  date: timestamp('date').notNull(),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  description: text('description'),
  amount: integer('amount').notNull(),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  poNumber: varchar('po_number', { length: 100 }),
  department: varchar('department', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: json('metadata')
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(),
  apiKey: text('api_key'),
  config: json('config'),
  lastSync: timestamp('last_sync'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: json('metadata')
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  config: json('config'),
  creator: integer('creator').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isCustom: boolean('is_custom').default(false).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  metadata: json('metadata')
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  layout: json('layout'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: json('metadata')
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  position: json('position').notNull(),
  config: json('config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: json('metadata')
}, (t) => ({
  unq: unique().on(t.dashboardId, t.widgetTypeId)
}))

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  role: true,
  avatar: true,
  company: true,
  title: true,
  phone: true,
  preferences: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  primaryContact: true,
  contactEmail: true,
  contactPhone: true,
  description: true,
  logo: true,
  tier: true,
  industry: true,
  createdBy: true,
  isActive: true,
  metadata: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  status: true,
  supplierId: true,
  userId: true,
  objectives: true,
  startDate: true,
  endDate: true,
  category: true,
  subcategory: true,
  categoryLevel3: true,
  budget: true,
  result: true,
  metadata: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  userId: true,
  supplierId: true,
  type: true,
  content: true,
  isAi: true,
  metadata: true,
  attachmentUrl: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
  supplierId: true,
  metadata: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  description: true,
  content: true,
  category: true,
  createdBy: true,
  isActive: true,
  variables: true,
  metadata: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  content: true,
  negotiationId: true,
  supplierId: true,
  userId: true,
  templateId: true,
  status: true,
  startDate: true,
  endDate: true,
  signedAt: true,
  value: true,
  signerName: true,
  signerTitle: true,
  signerEmail: true,
  metadata: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  supplierId: true,
  userId: true,
  title: true,
  content: true,
  status: true,
  terms: true,
  value: true,
  validUntil: true,
  attachmentUrl: true,
  metadata: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  fileSize: true,
  status: true,
  recordCount: true,
  mappingConfig: true,
  processedAt: true,
  errorLog: true,
  metadata: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  date: true,
  supplierName: true,
  supplierId: true,
  description: true,
  amount: true,
  category: true,
  subcategory: true,
  categoryLevel3: true,
  invoiceNumber: true,
  poNumber: true,
  department: true,
  metadata: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  provider: true,
  apiKey: true,
  config: true,
  lastSync: true,
  status: true,
  metadata: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  config: true,
  creator: true,
  isCustom: true,
  isPublic: true,
  metadata: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  description: true,
  layout: true,
  isDefault: true,
  metadata: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  position: true,
  config: true,
  metadata: true,
})

// Type definitions
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
  negotiations: many(negotiations),
  suppliers: many(suppliers, { relationName: "createdSuppliers" }),
  messages: many(messages),
  contractTemplates: many(contractTemplates),
  contracts: many(contracts),
  proposals: many(proposals),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
  widgetTypes: many(widgetTypes, { relationName: "createdWidgetTypes" }),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations),
  messages: many(messages),
  contracts: many(contracts),
  proposals: many(proposals),
  invitations: many(invitations),
  creator: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
    relationName: "createdSuppliers",
  }),
  spendData: many(spendData),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [negotiations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  contracts: many(contracts),
  proposals: many(proposals),
  invitations: many(invitations),
}))

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
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [invitations.supplierId],
    references: [suppliers.id],
  }),
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
  }),
  contracts: many(contracts),
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  supplier: one(suppliers, {
    fields: [proposals.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [proposals.userId],
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

export const widgetTypesRelations = relations(widgetTypes, ({ many, one }) => ({
  dashboardWidgets: many(dashboardWidgets),
  creator: one(users, {
    fields: [widgetTypes.creator],
    references: [users.id],
    relationName: "createdWidgetTypes",
  }),
}))