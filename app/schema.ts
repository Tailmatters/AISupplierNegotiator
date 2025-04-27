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
  real,
  date,
  numeric,
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
  username: varchar('username', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('buyer'),
  company: varchar('company', { length: 255 }),
  position: varchar('position', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  contactName: varchar('contact_name', { length: 255 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  category: varchar('category', { length: 255 }),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 255 }).notNull(),
  subcategory: varchar('subcategory', { length: 255 }),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  objectives: json('objectives'),
  constraints: json('constraints'),
  pastData: text('past_data'),
  aiAnalysis: json('ai_analysis'),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  initialValue: numeric('initial_value'),
  finalValue: numeric('final_value'),
  savingsPercent: real('savings_percent'),
  savingsAmount: numeric('savings_amount'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  receiverId: integer('receiver_id').references(() => users.id),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  fileUrl: text('file_url'),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 255 }),
  userId: integer('user_id').references(() => users.id).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),
  signedByBuyer: boolean('signed_by_buyer').default(false).notNull(),
  signedBySupplier: boolean('signed_by_supplier').default(false).notNull(),
  buyerSignatureDate: timestamp('buyer_signature_date'),
  supplierSignatureDate: timestamp('supplier_signature_date'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: json('content').notNull(),
  value: numeric('value'),
  status: proposalStatusEnum('status').default('draft').notNull(),
  messageId: integer('message_id').references(() => messages.id),
  previousProposalId: integer('previous_proposal_id').references(() => proposals.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  rowCount: integer('row_count').notNull(),
  processedCount: integer('processed_count').default(0).notNull(),
  status: varchar('status', { length: 50 }).default('processing').notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  columns: json('columns'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 255 }),
  invoiceDate: date('invoice_date'),
  purchaseOrderNumber: varchar('purchase_order_number', { length: 255 }),
  purchaseDate: date('purchase_date'),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  description: text('description'),
  category1: varchar('category_1', { length: 255 }),
  category2: varchar('category_2', { length: 255 }),
  category3: varchar('category_3', { length: 255 }),
  departmentId: varchar('department_id', { length: 100 }),
  departmentName: varchar('department_name', { length: 255 }),
  locationId: varchar('location_id', { length: 100 }),
  locationName: varchar('location_name', { length: 255 }),
  itemCount: integer('item_count'),
  unitPrice: numeric('unit_price'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  config: json('config').notNull(),
  lastSyncDate: timestamp('last_sync_date'),
  status: varchar('status', { length: 50 }).default('inactive').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  defaultConfig: json('default_config').notNull(),
  isSystem: boolean('is_system').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  layout: json('layout'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  config: json('config').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Schema validation with zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  email: true,
  password: true,
  role: true,
  company: true,
  position: true,
  phone: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  contactName: true,
  website: true,
  address: true,
  category: true,
  notes: true,
  userId: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  category: true,
  subcategory: true,
  userId: true,
  supplierId: true,
  objectives: true,
  constraints: true,
  pastData: true,
  status: true,
  initialValue: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  receiverId: true,
  content: true,
  type: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  isAiGenerated: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  content: true,
  category: true,
  userId: true,
  isDefault: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  content: true,
  templateId: true,
  negotiationId: true,
  buyerId: true,
  supplierId: true,
  status: true,
  effectiveDate: true,
  expirationDate: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  senderId: true,
  receiverId: true,
  title: true,
  description: true,
  content: true,
  value: true,
  status: true,
  messageId: true,
  previousProposalId: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  originalFileName: true,
  fileSize: true,
  rowCount: true,
  fileType: true,
  columns: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  userId: true,
  supplierId: true,
  supplierName: true,
  invoiceNumber: true,
  invoiceDate: true,
  purchaseOrderNumber: true,
  purchaseDate: true,
  amount: true,
  currency: true,
  description: true,
  category1: true,
  category2: true,
  category3: true,
  departmentId: true,
  departmentName: true,
  locationId: true,
  locationName: true,
  itemCount: true,
  unitPrice: true,
  metadata: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  type: true,
  config: true,
  lastSyncDate: true,
  status: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  defaultConfig: true,
  isSystem: true,
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
  contracts: many(contracts),
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
  receiver: one(users, {
    fields: [messages.receiverId],
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
  user: one(users, {
    fields: [contractTemplates.userId],
    references: [users.id],
  }),
  contracts: many(contracts),
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
  }),
  buyer: one(users, {
    fields: [contracts.buyerId],
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
  sender: one(users, {
    fields: [proposals.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [proposals.receiverId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [proposals.messageId],
    references: [messages.id],
  }),
  previousProposal: one(proposals, {
    fields: [proposals.previousProposalId],
    references: [proposals.id],
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
  user: one(users, {
    fields: [spendData.userId],
    references: [users.id],
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