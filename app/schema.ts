import { relations } from 'drizzle-orm'
import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  pgEnum, 
  decimal, 
  boolean, 
  date, 
  json 
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Define enums
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined'])
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'active', 'completed', 'cancelled'])
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'countered'])
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'active', 'expired', 'terminated'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'proposal', 'contract', 'file'])
export const widgetTypeEnum = pgEnum('widget_type', ['spend_summary', 'supplier_chart', 'category_breakdown', 'negotiation_status', 'savings_trend', 'custom'])

// Define tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: ${'100'} }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: roleEnum('role').notNull().default('buyer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }),
  contactName: varchar('contact_name', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  address: text('address'),
  website: varchar('website', { length: 255 }),
  notes: text('notes'),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  categoryL1: varchar('category_l1', { length: 100 }).notNull(),
  categoryL2: varchar('category_l2', { length: 100 }),
  categoryL3: varchar('category_l3', { length: 100 }),
  target: decimal('target', { precision: 10, scale: 2 }),
  status: negotiationStatusEnum('status').notNull().default('draft'),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  assignedToId: integer('assigned_to_id').references(() => users.id),
  invitationSent: boolean('invitation_sent').default(false),
  invitationToken: varchar('invitation_token', { length: 100 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  objectives: text('objectives'),
  result: text('result'),
  savingsTarget: decimal('savings_target', { precision: 10, scale: 2 }),
  savingsAchieved: decimal('savings_achieved', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  senderName: varchar('sender_name', { length: 100 }),
  content: text('content'),
  type: messageTypeEnum('type').notNull().default('text'),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
  attachmentName: varchar('attachment_name', { length: 255 }),
  isAi: boolean('is_ai').default(false),
  relatedToId: integer('related_to_id').references(() => messages.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  token: varchar('token', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
})

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  categoryL1: varchar('category_l1', { length: 100 }),
  categoryL2: varchar('category_l2', { length: 100 }),
  categoryL3: varchar('category_l3', { length: 100 }),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  status: contractStatusEnum('status').notNull().default('draft'),
  templateId: integer('template_id').references(() => contractTemplates.id),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  signedById: integer('signed_by_id').references(() => users.id),
  signedDate: timestamp('signed_date'),
  expiryDate: date('expiry_date'),
  fileUrl: varchar('file_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  status: proposalStatusEnum('status').notNull().default('draft'),
  createdById: integer('created_by_id').references(() => users.id),
  supplierName: varchar('supplier_name', { length: 100 }),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  fileUrl: varchar('file_url', { length: 255 }),
  responseToId: integer('response_to_id').references(() => proposals.id),
  messageId: integer('message_id').references(() => messages.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  fileSize: integer('file_size'),
  rowCount: integer('row_count'),
  uploadedById: integer('uploaded_by_id').references(() => users.id).notNull(),
  processedAt: timestamp('processed_at'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: date('invoice_date'),
  description: text('description'),
  categoryL1: varchar('category_l1', { length: 100 }),
  categoryL2: varchar('category_l2', { length: 100 }),
  categoryL3: varchar('category_l3', { length: 100 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  quantity: decimal('quantity', { precision: 10, scale: 3 }),
  unitPrice: decimal('unit_price', { precision: 10, scale: 4 }),
  uom: varchar('uom', { length: 50 }),
  year: integer('year'),
  month: integer('month'),
  quarter: integer('quarter'),
  glCode: varchar('gl_code', { length: 50 }),
  departmentCode: varchar('department_code', { length: 50 }),
  projectCode: varchar('project_code', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  credentials: json('credentials'),
  lastSyncAt: timestamp('last_sync_at'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  defaultWidth: integer('default_width'),
  defaultHeight: integer('default_height'),
  thumbnail: varchar('thumbnail', { length: 255 }),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  userId: integer('user_id').references(() => users.id).notNull(),
  isDefault: boolean('is_default').default(false),
  layoutConfig: json('layout_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widgetTypeId: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: varchar('title', { length: 100 }),
  config: json('config'),
  position: integer('position'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Define schemas for insertions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  code: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  address: true,
  website: true,
  notes: true,
  category: true,
  subcategory: true,
  createdBy: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  categoryL1: true,
  categoryL2: true,
  categoryL3: true,
  target: true,
  status: true,
  supplierId: true,
  createdById: true,
  assignedToId: true,
  startDate: true,
  endDate: true,
  objectives: true,
  savingsTarget: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  senderName: true,
  content: true,
  type: true,
  attachmentUrl: true,
  attachmentName: true,
  isAi: true,
  relatedToId: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  token: true,
  email: true,
  status: true,
  createdById: true,
  expiresAt: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  title: true,
  content: true,
  status: true,
  createdById: true,
  supplierName: true,
  amount: true,
  fileUrl: true,
  responseToId: true,
  messageId: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  content: true,
  categoryL1: true,
  categoryL2: true,
  categoryL3: true,
  createdById: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  content: true,
  negotiationId: true,
  supplierId: true,
  status: true,
  templateId: true,
  createdById: true,
  signedById: true,
  signedDate: true,
  expiryDate: true,
  fileUrl: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  filename: true,
  originalFilename: true,
  fileSize: true,
  rowCount: true,
  uploadedById: true,
  status: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  supplierName: true,
  invoiceNumber: true,
  invoiceDate: true,
  description: true,
  categoryL1: true,
  categoryL2: true,
  categoryL3: true,
  amount: true,
  currency: true,
  quantity: true,
  unitPrice: true,
  uom: true,
  year: true,
  month: true,
  quarter: true,
  glCode: true,
  departmentCode: true,
  projectCode: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  name: true,
  type: true,
  credentials: true,
  createdById: true,
  status: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  defaultWidth: true,
  defaultHeight: true,
  thumbnail: true,
  available: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  description: true,
  userId: true,
  isDefault: true,
  layoutConfig: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  config: true,
  position: true,
  width: true,
  height: true,
})

// Define types
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
  suppliers: many(suppliers, { relationName: 'userSuppliers' }),
  negotiations: many(negotiations, { relationName: 'userNegotiations' }),
  assignedNegotiations: many(negotiations, { relationName: 'assignedNegotiations' }),
  invitations: many(invitations),
  contractTemplates: many(contractTemplates),
  contracts: many(contracts, { relationName: 'userContracts' }),
  signedContracts: many(contracts, { relationName: 'signedContracts' }),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations),
  contracts: many(contracts),
  spendData: many(spendData),
  createdBy: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
    relationName: 'userSuppliers',
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
    relationName: 'userNegotiations',
  }),
  assignedTo: one(users, {
    fields: [negotiations.assignedToId],
    references: [users.id],
    relationName: 'assignedNegotiations',
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
  relatedTo: one(messages, {
    fields: [messages.relatedToId],
    references: [messages.id],
  }),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
  }),
  createdBy: one(users, {
    fields: [invitations.createdById],
    references: [users.id],
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
  responseTo: one(proposals, {
    fields: [proposals.responseToId],
    references: [proposals.id],
  }),
  message: one(messages, {
    fields: [proposals.messageId],
    references: [messages.id],
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
    relationName: 'userContracts',
  }),
  signedBy: one(users, {
    fields: [contracts.signedById],
    references: [users.id],
    relationName: 'signedContracts',
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
  dashboardWidgets: many(dashboardWidgets),
}))