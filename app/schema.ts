import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
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

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: roleEnum('role').notNull().default('buyer'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  contactPerson: text('contact_person'),
  category: text('category'),
  address: text('address'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Negotiations table
export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  supplierName: text('supplier_name'),
  supplierEmail: text('supplier_email'),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  status: negotiationStatusEnum('status').notNull().default('draft'),
  objectives: text('objectives'),
  pastData: text('past_data'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  type: messageTypeEnum('type').notNull().default('text'),
  content: text('content').notNull(),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Contract Templates table
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  content: text('content').notNull(),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').notNull().default('draft'),
  templateId: integer('template_id').references(() => contractTemplates.id),
  buyerId: integer('buyer_id').references(() => users.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  signedDate: timestamp('signed_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Proposals table
export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: proposalStatusEnum('status').notNull().default('draft'),
  senderId: integer('sender_id').references(() => users.id),
  recipientId: integer('recipient_id').references(() => users.id),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Spend Uploads table
export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  uploadedById: integer('uploaded_by_id').references(() => users.id),
  fileUrl: text('file_url'),
  fileName: text('file_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Spend Data table
export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplier: text('supplier').notNull(),
  category1: text('category_1'),
  category2: text('category_2'),
  category3: text('category_3'),
  amount: text('amount').notNull(),
  date: timestamp('date'),
  description: text('description'),
  invoiceNumber: text('invoice_number'),
})

// API Connections table
export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  apiKey: text('api_key'),
  endpoint: text('endpoint'),
  lastSync: timestamp('last_sync'),
  createdById: integer('created_by_id').references(() => users.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Widget Types table
export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: widgetTypeEnum('type').notNull(),
  description: text('description'),
  isCustom: boolean('is_custom').default(false),
  config: text('config'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Dashboards table
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Dashboard Widgets table
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  width: integer('width').notNull().default(1),
  height: integer('height').notNull().default(1),
  config: text('config'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Insertion schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  contactPerson: true,
  category: true,
  address: true,
  createdById: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  category: true,
  supplierName: true,
  supplierEmail: true,
  supplierId: true,
  status: true,
  objectives: true,
  pastData: true,
  createdById: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  type: true,
  content: true,
  fileUrl: true,
  fileName: true,
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
  title: true,
  content: true,
  status: true,
  senderId: true,
  recipientId: true,
  fileUrl: true,
  fileName: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  category: true,
  content: true,
  createdById: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  title: true,
  content: true,
  status: true,
  templateId: true,
  buyerId: true,
  supplierId: true,
  signedDate: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  name: true,
  description: true,
  uploadedById: true,
  fileUrl: true,
  fileName: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplier: true,
  category1: true,
  category2: true,
  category3: true,
  amount: true,
  date: true,
  description: true,
  invoiceNumber: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  name: true,
  type: true,
  apiKey: true,
  endpoint: true,
  createdById: true,
  isActive: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  type: true,
  description: true,
  isCustom: true,
  config: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  userId: true,
  isDefault: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  position: true,
  width: true,
  height: true,
  config: true,
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
  dashboards: many(dashboards),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  createdBy: one(users, {
    fields: [suppliers.createdById],
    references: [users.id],
  }),
  negotiations: many(negotiations),
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
  recipient: one(users, {
    fields: [proposals.recipientId],
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
  buyer: one(users, {
    fields: [contracts.buyerId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
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