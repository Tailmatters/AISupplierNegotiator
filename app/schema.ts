import { pgTable, pgEnum, serial, text, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
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
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  role: roleEnum('role').default('buyer').notNull(),
  company: varchar('company', { length: 255 }),
  title: varchar('title', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  profileImage: varchar('profile_image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  category1: varchar('category_1', { length: 255 }),
  category2: varchar('category_2', { length: 255 }),
  category3: varchar('category_3', { length: 255 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 255 }),
  state: varchar('state', { length: 255 }),
  postalCode: varchar('postal_code', { length: 50 }),
  country: varchar('country', { length: 255 }),
  website: varchar('website', { length: 255 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Negotiations table
export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  category1: varchar('category_1', { length: 255 }).notNull(),
  category2: varchar('category_2', { length: 255 }),
  category3: varchar('category_3', { length: 255 }),
  description: text('description'),
  objectives: text('objectives'),
  targetSavings: integer('target_savings'),
  supplierNotes: text('supplier_notes'),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'restrict' }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  pastDataUrl: varchar('past_data_url', { length: 255 }),
  strategyNotes: text('strategy_notes'),
  currentSpend: integer('current_spend'),
  aiAnalysis: text('ai_analysis'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').notNull().references(() => negotiations.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'restrict' }),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  relatedEntityId: integer('related_entity_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  metadata: text('metadata'),
})

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').notNull().references(() => negotiations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Contract Templates table
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  category1: varchar('category_1', { length: 255 }),
  category2: varchar('category_2', { length: 255 }),
  category3: varchar('category_3', { length: 255 }),
  content: text('content').notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  isDefaultForCategory: boolean('is_default_for_category').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'restrict' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'restrict' }),
  templateId: integer('template_id').references(() => contractTemplates.id, { onDelete: 'restrict' }),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  value: integer('value'),
  signedByBuyerId: integer('signed_by_buyer_id').references(() => users.id, { onDelete: 'restrict' }),
  signedBySupplierName: varchar('signed_by_supplier_name', { length: 255 }),
  signedByBuyerAt: timestamp('signed_by_buyer_at'),
  signedBySupplierAt: timestamp('signed_by_supplier_at'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  fileUrl: varchar('file_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Proposals table
export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').notNull().references(() => negotiations.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: proposalStatusEnum('status').default('draft').notNull(),
  proposedBy: integer('proposed_by').references(() => users.id, { onDelete: 'restrict' }),
  proposedBySupplier: boolean('proposed_by_supplier').default(false).notNull(),
  value: integer('value'),
  savings: integer('savings'),
  responseDeadline: timestamp('response_deadline'),
  respondedAt: timestamp('responded_at'),
  fileUrl: varchar('file_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Spend Uploads table
export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  recordCount: integer('record_count'),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'restrict' }),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending').notNull(),
  processingErrors: text('processing_errors'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Spend Data table
export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id, { onDelete: 'cascade' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 255 }),
  invoiceDate: timestamp('invoice_date'),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  description: text('description'),
  category1: varchar('category_1', { length: 255 }),
  category2: varchar('category_2', { length: 255 }),
  category3: varchar('category_3', { length: 255 }),
  department: varchar('department', { length: 255 }),
  location: varchar('location', { length: 255 }),
  glCode: varchar('gl_code', { length: 255 }),
  year: integer('year'),
  month: integer('month'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// API Connections table
export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 255 }),
  apiSecret: varchar('api_secret', { length: 255 }),
  configData: text('config_data'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  lastSync: timestamp('last_sync'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Widget Types table
export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: widgetTypeEnum('type').notNull(),
  description: text('description'),
  defaultConfig: text('default_config'),
  icon: varchar('icon', { length: 255 }),
  isSystem: boolean('is_system').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Dashboards table
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  layout: text('layout'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Dashboard Widgets table
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').notNull().references(() => dashboards.id, { onDelete: 'cascade' }),
  widgetTypeId: integer('widget_type_id').notNull().references(() => widgetTypes.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  config: text('config'),
  position: integer('position').default(0).notNull(),
  size: varchar('size', { length: 50 }).default('medium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  company: true,
  title: true,
  phone: true,
  profileImage: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contactEmail: true,
  contactName: true,
  contactPhone: true,
  category1: true,
  category2: true,
  category3: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  website: true,
  notes: true,
  createdBy: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  category1: true,
  category2: true,
  category3: true,
  description: true,
  objectives: true,
  targetSavings: true,
  supplierNotes: true,
  status: true,
  supplierId: true,
  createdBy: true,
  pastDataUrl: true,
  strategyNotes: true,
  currentSpend: true,
  aiAnalysis: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  content: true,
  type: true,
  relatedEntityId: true,
  metadata: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
  createdBy: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  title: true,
  category1: true,
  category2: true,
  category3: true,
  content: true,
  createdBy: true,
  isDefaultForCategory: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  negotiationId: true,
  supplierId: true,
  templateId: true,
  content: true,
  status: true,
  startDate: true,
  endDate: true,
  value: true,
  signedByBuyerId: true,
  signedBySupplierName: true,
  signedByBuyerAt: true,
  signedBySupplierAt: true,
  createdBy: true,
  fileUrl: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  title: true,
  content: true,
  status: true,
  proposedBy: true,
  proposedBySupplier: true,
  value: true,
  savings: true,
  responseDeadline: true,
  fileUrl: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  filename: true,
  filePath: true,
  fileSize: true,
  recordCount: true,
  uploadedBy: true,
  processingStatus: true,
  processingErrors: true,
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
  currency: true,
  description: true,
  category1: true,
  category2: true,
  category3: true,
  department: true,
  location: true,
  glCode: true,
  year: true,
  month: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  name: true,
  provider: true,
  apiKey: true,
  apiSecret: true,
  configData: true,
  createdBy: true,
  status: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  type: true,
  description: true,
  defaultConfig: true,
  icon: true,
  isSystem: true,
  createdBy: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  description: true,
  isDefault: true,
  layout: true,
  userId: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  config: true,
  position: true,
  size: true,
})

// Typescript types for inference
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

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers, { relationName: 'user_suppliers' }),
  negotiations: many(negotiations, { relationName: 'user_negotiations' }),
  invitations: many(invitations, { relationName: 'user_invitations' }),
  contractTemplates: many(contractTemplates, { relationName: 'user_contract_templates' }),
  contracts: many(contracts, { relationName: 'user_contracts' }),
  signedContracts: many(contracts, { relationName: 'user_signed_contracts' }),
  proposals: many(proposals, { relationName: 'user_proposals' }),
  spendUploads: many(spendUploads, { relationName: 'user_spend_uploads' }),
  apiConnections: many(apiConnections, { relationName: 'user_api_connections' }),
  widgetTypes: many(widgetTypes, { relationName: 'user_widget_types' }),
  dashboards: many(dashboards, { relationName: 'user_dashboards' }),
  messages: many(messages, { relationName: 'user_messages' }),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations, { relationName: 'supplier_negotiations' }),
  contracts: many(contracts, { relationName: 'supplier_contracts' }),
  spendData: many(spendData, { relationName: 'supplier_spend_data' }),
  createdBy: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
    relationName: 'user_suppliers',
  }),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
    relationName: 'supplier_negotiations',
  }),
  createdBy: one(users, {
    fields: [negotiations.createdBy],
    references: [users.id],
    relationName: 'user_negotiations',
  }),
  messages: many(messages, { relationName: 'negotiation_messages' }),
  invitations: many(invitations, { relationName: 'negotiation_invitations' }),
  contracts: many(contracts, { relationName: 'negotiation_contracts' }),
  proposals: many(proposals, { relationName: 'negotiation_proposals' }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiation_messages',
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'user_messages',
  }),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiation_invitations',
  }),
  createdBy: one(users, {
    fields: [invitations.createdBy],
    references: [users.id],
    relationName: 'user_invitations',
  }),
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
    relationName: 'user_contract_templates',
  }),
  contracts: many(contracts, { relationName: 'template_contracts' }),
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiation_contracts',
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
    relationName: 'supplier_contracts',
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
    relationName: 'template_contracts',
  }),
  createdBy: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
    relationName: 'user_contracts',
  }),
  signedByBuyer: one(users, {
    fields: [contracts.signedByBuyerId],
    references: [users.id],
    relationName: 'user_signed_contracts',
  }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
    relationName: 'negotiation_proposals',
  }),
  proposedBy: one(users, {
    fields: [proposals.proposedBy],
    references: [users.id],
    relationName: 'user_proposals',
  }),
}))

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [spendUploads.uploadedBy],
    references: [users.id],
    relationName: 'user_spend_uploads',
  }),
  spendData: many(spendData, { relationName: 'upload_spend_data' }),
}))

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
    relationName: 'upload_spend_data',
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplierId],
    references: [suppliers.id],
    relationName: 'supplier_spend_data',
  }),
}))

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  createdBy: one(users, {
    fields: [apiConnections.createdBy],
    references: [users.id],
    relationName: 'user_api_connections',
  }),
}))

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
    relationName: 'user_dashboards',
  }),
  widgets: many(dashboardWidgets, { relationName: 'dashboard_widgets' }),
}))

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
    relationName: 'dashboard_widgets',
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widgetTypeId],
    references: [widgetTypes.id],
    relationName: 'widget_type_widgets',
  }),
}))

export const widgetTypesRelations = relations(widgetTypes, ({ many }) => ({
  widgets: many(dashboardWidgets, { relationName: 'widget_type_widgets' }),
  createdBy: one(users, {
    fields: [widgetTypes.createdBy],
    references: [users.id],
    relationName: 'user_widget_types',
  }),
}))