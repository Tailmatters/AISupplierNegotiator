import { pgTable, text, integer, uuid, timestamp, pgEnum, boolean, date, numeric, jsonb } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { relations } from "drizzle-orm"
import { z } from "zod"

export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined'])
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'active', 'completed', 'cancelled'])
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'countered'])
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'active', 'expired', 'terminated'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'proposal', 'contract', 'file'])
export const widgetTypeEnum = pgEnum('widget_type', ['spend_summary', 'supplier_chart', 'category_breakdown', 'negotiation_status', 'savings_trend', 'custom'])

export const users = pgTable('users', {
  id: integer('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('buyer').notNull(),
  name: text('name'),
  email: text('email'),
  companyName: text('company_name'),
  companyLogo: text('company_logo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  category: text('category'),
  address: text('address'),
  contactName: text('contact_name'),
  contactTitle: text('contact_title'),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: integer('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  initialOffer: numeric('initial_offer'),
  targetOffer: numeric('target_offer'),
  finalOffer: numeric('final_offer'),
  objectives: jsonb('objectives'),
  aiNotes: text('ai_notes'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: integer('id').primaryKey().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  senderType: text('sender_type').notNull(), // 'user', 'supplier', 'system', 'ai'
  messageType: messageTypeEnum('message_type').default('text').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: integer('id').primaryKey().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  token: uuid('token').defaultRandom().notNull(),
  email: text('email').notNull(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  content: text('content').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  signedBy: integer('signed_by').references(() => users.id),
  signedAt: timestamp('signed_at'),
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const proposals = pgTable('proposals', {
  id: integer('id').primaryKey().notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  amount: numeric('amount'),
  status: proposalStatusEnum('status').default('draft').notNull(),
  createdById: integer('created_by_id').references(() => users.id),
  createdByType: text('created_by_type').notNull(), // 'user', 'supplier', 'ai'
  respondedById: integer('responded_by_id').references(() => users.id),
  respondedByType: text('responded_by_type'), // 'user', 'supplier', 'ai'
  respondedAt: timestamp('responded_at'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  filename: text('filename').notNull(),
  filesize: integer('filesize').notNull(),
  recordCount: integer('record_count'),
  source: text('source').notNull(), // 'csv', 'api', etc.
  status: text('status').notNull(), // 'processing', 'completed', 'error'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendData = pgTable('spend_data', {
  id: integer('id').primaryKey().notNull(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: text('supplier_name').notNull(),
  categoryLevel1: text('category_level_1'),
  categoryLevel2: text('category_level_2'),
  categoryLevel3: text('category_level_3'),
  description: text('description'),
  amount: numeric('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  date: date('date').notNull(),
  invoiceNumber: text('invoice_number'),
  poNumber: text('po_number'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'erp', 'procure-to-pay', etc.
  config: jsonb('config').notNull(),
  status: text('status').notNull(), // 'active', 'inactive', 'error'
  lastSyncAt: timestamp('last_sync_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: integer('id').primaryKey().notNull(),
  type: widgetTypeEnum('type').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  defaultConfig: jsonb('default_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: integer('id').primaryKey().notNull(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  position: integer('position').notNull(),
  size: text('size').default('medium').notNull(), // 'small', 'medium', 'large'
  title: text('title'),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  companyName: true,
  companyLogo: true,
})

// Schema for inserting suppliers
export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  website: true,
  category: true,
  address: true,
  contactName: true,
  contactTitle: true,
  notes: true,
  userId: true,
})

// Schema for inserting negotiations
export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  category: true,
  status: true,
  userId: true,
  supplierId: true,
  initialOffer: true,
  targetOffer: true,
  objectives: true,
  startDate: true,
})

// Schema for inserting messages
export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  senderType: true,
  messageType: true,
  content: true,
  metadata: true,
})

// Schema for inserting invitations
export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  expiresAt: true,
})

// Schema for inserting proposals
export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  title: true,
  content: true,
  amount: true,
  status: true,
  createdById: true,
  createdByType: true,
  fileUrl: true,
})

// Schema for inserting contract templates
export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  description: true,
  category: true,
  content: true,
  userId: true,
})

// Schema for inserting contracts
export const insertContractSchema = createInsertSchema(contracts).pick({
  name: true,
  negotiationId: true,
  templateId: true,
  content: true,
  status: true,
  effectiveDate: true,
  expirationDate: true,
})

// Schema for inserting spend uploads
export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  filename: true,
  filesize: true,
  source: true,
  status: true,
})

// Schema for inserting spend data
export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  supplierName: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  description: true,
  amount: true,
  currency: true,
  date: true,
  invoiceNumber: true,
  poNumber: true,
  metadata: true,
})

// Schema for inserting API connections
export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  userId: true,
  name: true,
  type: true,
  config: true,
  status: true,
})

// Schema for inserting widget types
export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  type: true,
  name: true,
  description: true,
  defaultConfig: true,
})

// Schema for inserting dashboards
export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  isDefault: true,
})

// Schema for inserting dashboard widgets
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  position: true,
  size: true,
  title: true,
  config: true,
})

// TypeScript types
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
  dashboards: many(dashboards),
  apiConnections: many(apiConnections),
  spendUploads: many(spendUploads),
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
  createdBy: one(users, {
    fields: [proposals.createdById],
    references: [users.id],
  }),
  respondedBy: one(users, {
    fields: [proposals.respondedById],
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
  signedBy: one(users, {
    fields: [contracts.signedBy],
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