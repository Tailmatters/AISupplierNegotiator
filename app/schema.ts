import { pgTable, pgEnum, serial, text, varchar, boolean, integer, timestamp, foreignKey, uniqueIndex, date, numeric, json } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { z } from 'zod'

// Enums for database table columns
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
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').default('buyer').notNull(),
  company: varchar('company', { length: 255 }),
  position: varchar('position', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  profileImage: varchar('profile_image', { length: 255 }),
  preferences: json('preferences').$type<Record<string, any>>(),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  category: varchar('category', { length: 255 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).default('active'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Negotiations table
export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 255 }).notNull(),
  subcategory: varchar('subcategory', { length: 255 }),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  objectives: json('objectives').$type<{ target: number, min: number, type: string }>(),
  aiAnalysis: json('ai_analysis').$type<Record<string, any>>(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  initiatedBy: integer('initiated_by').references(() => users.id).notNull(),
  startDate: timestamp('start_date'),
  completionDate: timestamp('completion_date'),
  result: json('result').$type<{ success: boolean, savings: number, notes: string }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  senderType: varchar('sender_type', { length: 50 }).notNull(), // 'user', 'ai', 'supplier'
  content: text('content').notNull(),
  messageType: messageTypeEnum('message_type').default('text').notNull(),
  metadata: json('metadata').$type<Record<string, any>>(),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastSentAt: timestamp('last_sent_at').defaultNow().notNull(),
  sentBy: integer('sent_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Contract Templates table
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  content: text('content').notNull(),
  variables: json('variables').$type<string[]>(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id),
  templateId: integer('template_id').references(() => contractTemplates.id),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  signedByBuyer: boolean('signed_by_buyer').default(false).notNull(),
  signedBySeller: boolean('signed_by_seller').default(false).notNull(),
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),
  value: numeric('value', { precision: 10, scale: 2 }),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Proposals table
export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  status: proposalStatusEnum('status').default('draft').notNull(),
  proposedBy: varchar('proposed_by', { length: 50 }).notNull(), // 'buyer', 'supplier', 'ai'
  userId: integer('user_id').references(() => users.id),
  terms: json('terms').$type<Record<string, any>>(),
  fileUrl: varchar('file_url', { length: 255 }),
  nextSteps: text('next_steps'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Spend Uploads table
export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(),
  rowCount: integer('row_count'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending').notNull(),
  processingErrors: text('processing_errors'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull()
})

// Spend Data table
export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: date('invoice_date'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  description: text('description'),
  category1: varchar('category_1', { length: 255 }),
  category2: varchar('category_2', { length: 255 }),
  category3: varchar('category_3', { length: 255 }),
  department: varchar('department', { length: 255 }),
  purchaseOrder: varchar('purchase_order', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// API Connections table
export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(), // 'coupa', 'sap_ariba', 'jaggaer', etc.
  config: json('config').$type<Record<string, any>>().notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Widget Types table
export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  defaultConfig: json('default_config').$type<Record<string, any>>().notNull(),
  icon: varchar('icon', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Dashboards table
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  layout: json('layout').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Dashboard Widgets table
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  config: json('config').$type<Record<string, any>>(),
  position: json('position').$type<{ x: number, y: number, w: number, h: number }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  company: true,
  position: true,
  phone: true,
  profileImage: true,
  preferences: true
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  category: true,
  notes: true,
  status: true,
  createdBy: true
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  category: true,
  subcategory: true,
  status: true,
  objectives: true,
  aiAnalysis: true,
  supplierId: true,
  initiatedBy: true,
  startDate: true,
  completionDate: true,
  result: true
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  senderType: true,
  content: true,
  messageType: true,
  metadata: true,
  attachmentUrl: true
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
  lastSentAt: true,
  sentBy: true
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  title: true,
  content: true,
  status: true,
  proposedBy: true,
  userId: true,
  terms: true,
  fileUrl: true,
  nextSteps: true,
  expiresAt: true
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  category: true,
  content: true,
  variables: true,
  isDefault: true,
  createdBy: true
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  negotiationId: true,
  templateId: true,
  content: true,
  status: true,
  supplierId: true,
  signedByBuyer: true,
  signedBySeller: true,
  effectiveDate: true,
  expirationDate: true,
  value: true,
  createdBy: true
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  originalFileName: true,
  fileSize: true,
  fileType: true,
  rowCount: true,
  processingStatus: true,
  processingErrors: true
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
  category1: true,
  category2: true,
  category3: true,
  department: true,
  purchaseOrder: true,
  paymentMethod: true
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  provider: true,
  config: true,
  status: true,
  lastSyncAt: true
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  defaultConfig: true,
  icon: true
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  description: true,
  isDefault: true,
  layout: true
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  config: true,
  position: true
})

// Export types
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

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers, { relationName: 'userSuppliers' }),
  negotiations: many(negotiations, { relationName: 'userNegotiations' }),
  invitations: many(invitations, { relationName: 'userInvitations' }),
  contractTemplates: many(contractTemplates, { relationName: 'userContractTemplates' }),
  contracts: many(contracts, { relationName: 'userContracts' }),
  spendUploads: many(spendUploads, { relationName: 'userSpendUploads' }),
  apiConnections: many(apiConnections, { relationName: 'userApiConnections' }),
  dashboards: many(dashboards, { relationName: 'userDashboards' })
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations, { relationName: 'supplierNegotiations' }),
  contracts: many(contracts, { relationName: 'supplierContracts' }),
  spendData: many(spendData, { relationName: 'supplierSpendData' }),
  createdByUser: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
    relationName: 'userSuppliers'
  })
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
    relationName: 'supplierNegotiations'
  }),
  initiator: one(users, {
    fields: [negotiations.initiatedBy],
    references: [users.id],
    relationName: 'userNegotiations'
  }),
  messages: many(messages, { relationName: 'negotiationMessages' }),
  invitations: many(invitations, { relationName: 'negotiationInvitations' }),
  proposals: many(proposals, { relationName: 'negotiationProposals' }),
  contracts: many(contracts, { relationName: 'negotiationContracts' })
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiationMessages'
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'userMessages'
  })
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiationInvitations'
  }),
  sentByUser: one(users, {
    fields: [invitations.sentBy],
    references: [users.id],
    relationName: 'userInvitations'
  })
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiationProposals'
  }),
  user: one(users, {
    fields: [proposals.userId],
    references: [users.id],
    relationName: 'userProposals'
  })
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
    relationName: 'userContractTemplates'
  }),
  contracts: many(contracts, { relationName: 'templateContracts' })
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiationContracts'
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
    relationName: 'templateContracts'
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
    relationName: 'supplierContracts'
  }),
  createdByUser: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
    relationName: 'userContracts'
  })
}))

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.userId],
    references: [users.id],
    relationName: 'userSpendUploads'
  }),
  spendData: many(spendData, { relationName: 'uploadSpendData' })
}))

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
    relationName: 'uploadSpendData'
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplierId],
    references: [suppliers.id],
    relationName: 'supplierSpendData'
  })
}))

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, {
    fields: [apiConnections.userId],
    references: [users.id],
    relationName: 'userApiConnections'
  })
}))

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
    relationName: 'userDashboards'
  }),
  widgets: many(dashboardWidgets, { relationName: 'dashboardWidgets' })
}))

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
    relationName: 'dashboardWidgets'
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widgetTypeId],
    references: [widgetTypes.id],
    relationName: 'widgetTypeInstances'
  })
}))

export const widgetTypesRelations = relations(widgetTypes, ({ many }) => ({
  instances: many(dashboardWidgets, { relationName: 'widgetTypeInstances' })
}))