import { pgTable, text, serial, pgEnum, timestamp, integer, boolean, json, bigint, jsonb, varchar, uuid } from 'drizzle-orm/pg-core'
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

// Table Definitions
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('buyer'),
  company: text('company'),
  jobTitle: text('job_title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  description: text('description'),
  logo: text('logo'),
  industry: text('industry'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  country: text('country'),
  notes: text('notes'),
  totalSpend: integer('total_spend').default(0),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  categoryLevel3: text('category_level_3'),
  status: negotiationStatusEnum('status').notNull().default('draft'),
  objectives: json('objectives').$type<{
    targetPrice?: number;
    targetSavings?: number;
    targetLeadTime?: number;
    otherTerms?: string;
  }>(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  results: json('results').$type<{
    finalPrice?: number;
    savings?: number;
    leadTime?: number;
    otherTerms?: string;
    performanceRating?: number;
    notes?: string;
  }>(),
  aiPrompt: text('ai_prompt'),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
  senderType: text('sender_type').notNull(), // 'user', 'ai', 'supplier'
  content: text('content').notNull(),
  type: messageTypeEnum('type').notNull().default('text'),
  attachmentUrl: text('attachment_url'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: text('category'),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').notNull().default('draft'),
  signedUrl: text('signed_url'),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'set null' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  templateId: integer('template_id').references(() => contractTemplates.id, { onDelete: 'set null' }),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id, { onDelete: 'cascade' }).notNull(),
  price: integer('price'),
  currency: text('currency').default('USD'),
  leadTime: integer('lead_time'),
  otherTerms: text('other_terms'),
  status: proposalStatusEnum('status').notNull().default('draft'),
  attachmentUrl: text('attachment_url'),
  senderId: integer('sender_id'), // Could be either user or supplier
  senderType: text('sender_type').notNull(), // 'user', 'ai', 'supplier'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  rowCount: integer('row_count'),
  fileUrl: text('file_url'),
  uploadedById: integer('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  processingStatus: text('processing_status').notNull().default('pending'),
  processingErrors: text('processing_errors'),
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number'),
  invoiceDate: timestamp('invoice_date'),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  supplierName: text('supplier_name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  categoryLevel3: text('category_level_3'),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  quantity: integer('quantity'),
  unitPrice: integer('unit_price'),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  notes: text('notes'),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'ERP', 'Procurement System', etc.
  config: json('config').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  defaultConfig: json('default_config').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id, { onDelete: 'cascade' }).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  size: text('size').notNull().default('medium'), // small, medium, large
  config: json('config').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  company: true,
  jobTitle: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  website: true,
  description: true,
  logo: true,
  industry: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  notes: true,
  totalSpend: true,
  createdById: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  category: true,
  subcategory: true,
  categoryLevel3: true,
  status: true,
  objectives: true,
  startDate: true,
  endDate: true,
  results: true,
  aiPrompt: true,
  supplierId: true,
  createdById: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  senderType: true,
  content: true,
  type: true,
  attachmentUrl: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  supplierId: true,
  email: true,
  token: true,
  status: true,
  expiresAt: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  price: true,
  currency: true,
  leadTime: true,
  otherTerms: true,
  status: true,
  attachmentUrl: true,
  senderId: true,
  senderType: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  description: true,
  content: true,
  category: true,
  createdById: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  name: true,
  content: true,
  status: true,
  signedUrl: true,
  negotiationId: true,
  supplierId: true,
  templateId: true,
  createdById: true,
  startDate: true,
  endDate: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  fileName: true,
  fileSize: true,
  rowCount: true,
  fileUrl: true,
  uploadedById: true,
  processingStatus: true,
  processingErrors: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  invoiceNumber: true,
  invoiceDate: true,
  supplierId: true,
  supplierName: true,
  description: true,
  category: true,
  subcategory: true,
  categoryLevel3: true,
  amount: true,
  currency: true,
  quantity: true,
  unitPrice: true,
  year: true,
  month: true,
  notes: true,
  createdById: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  name: true,
  type: true,
  config: true,
  lastSyncAt: true,
  createdById: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  defaultConfig: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  description: true,
  isDefault: true,
  userId: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  position: true,
  size: true,
  config: true,
})

// Type Exports
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

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  contracts: many(contracts),
  dashboards: many(dashboards),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations),
  contracts: many(contracts),
  invitations: many(invitations),
  createdBy: one(users, {
    fields: [suppliers.createdById],
    references: [users.id],
  }),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [negotiations.createdById],
    references: [users.id],
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
  supplier: one(suppliers, {
    fields: [invitations.supplierId],
    references: [suppliers.id],
  }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
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
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
  createdBy: one(users, {
    fields: [contracts.createdById],
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
  createdBy: one(users, {
    fields: [spendData.createdById],
    references: [users.id],
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
  dashboardWidgets: many(dashboardWidgets),
}))