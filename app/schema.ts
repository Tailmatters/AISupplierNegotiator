import { pgTable, pgEnum, text, integer, uuid, timestamp, jsonb, boolean, numeric } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
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
  id: integer('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: roleEnum('role').default('buyer').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliers = pgTable('suppliers', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  address: text('address'),
  category_level1: text('category_level1'),
  category_level2: text('category_level2'),
  category_level3: text('category_level3'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: integer('created_by').references(() => users.id),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiations = pgTable('negotiations', {
  id: integer('id').primaryKey().notNull(),
  title: text('title').notNull(),
  supplier_id: integer('supplier_id').references(() => suppliers.id).notNull(),
  created_by: integer('created_by').references(() => users.id).notNull(),
  status: negotiationStatusEnum('status').default('draft').notNull(),
  category_level1: text('category_level1'),
  category_level2: text('category_level2'),
  category_level3: text('category_level3'),
  objectives: jsonb('objectives'),
  final_offer: numeric('final_offer'),
  initial_offer: numeric('initial_offer'),
  savings_amount: numeric('savings_amount'),
  savings_percentage: numeric('savings_percentage'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  concluded_at: timestamp('concluded_at'),
})

export const messages = pgTable('messages', {
  id: integer('id').primaryKey().notNull(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id).notNull(),
  sender_id: integer('sender_id').references(() => users.id),
  sender_type: text('sender_type').notNull(), // 'ai', 'buyer', 'supplier'
  message_type: messageTypeEnum('message_type').default('text').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  related_entity_id: integer('related_entity_id'), // Could reference proposals, contracts, etc.
  file_path: text('file_path'),
  file_name: text('file_name'),
  is_visible_to_supplier: boolean('is_visible_to_supplier').default(true).notNull(),
})

export const invitations = pgTable('invitations', {
  id: integer('id').primaryKey().notNull(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id).notNull(),
  supplier_id: integer('supplier_id').references(() => suppliers.id).notNull(),
  token: uuid('token').notNull(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  email_sent: boolean('email_sent').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  expired_at: timestamp('expired_at'),
})

export const contractTemplates = pgTable('contract_templates', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  created_by: integer('created_by').references(() => users.id).notNull(),
  category_level1: text('category_level1'),
  category_level2: text('category_level2'),
  category_level3: text('category_level3'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const contracts = pgTable('contracts', {
  id: integer('id').primaryKey().notNull(),
  title: text('title').notNull(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id).notNull(),
  template_id: integer('template_id').references(() => contractTemplates.id),
  content: text('content').notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  created_by: integer('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  signed_at: timestamp('signed_at'),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
})

export const proposals = pgTable('proposals', {
  id: integer('id').primaryKey().notNull(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id).notNull(),
  creator_id: integer('creator_id').references(() => users.id),
  creator_type: text('creator_type').notNull(), // 'ai', 'buyer', 'supplier'
  status: proposalStatusEnum('status').default('draft').notNull(),
  price: numeric('price'),
  terms: jsonb('terms'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  valid_until: timestamp('valid_until'),
  is_visible_to_supplier: boolean('is_visible_to_supplier').default(true).notNull(),
})

export const spendUploads = pgTable('spend_uploads', {
  id: integer('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  file_name: text('file_name').notNull(),
  file_path: text('file_path'),
  row_count: integer('row_count'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'processing', 'completed', 'error'
  error_message: text('error_message'),
})

export const spendData = pgTable('spend_data', {
  id: integer('id').primaryKey().notNull(),
  upload_id: integer('upload_id').references(() => spendUploads.id).notNull(),
  supplier_id: integer('supplier_id').references(() => suppliers.id),
  supplier_name: text('supplier_name').notNull(),
  invoice_number: text('invoice_number'),
  invoice_date: timestamp('invoice_date'),
  category_level1: text('category_level1'),
  category_level2: text('category_level2'),
  category_level3: text('category_level3'),
  amount: numeric('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  description: text('description'),
  item_code: text('item_code'),
  quantity: numeric('quantity'),
  unit_price: numeric('unit_price'),
  year: integer('year'),
  month: integer('month'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const apiConnections = pgTable('api_connections', {
  id: integer('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  api_type: text('api_type').notNull(), // 'coupa', 'sap', 'custom', etc.
  credentials: jsonb('credentials'),
  status: text('status').default('active').notNull(),
  last_sync: timestamp('last_sync'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const widgetTypes = pgTable('widget_types', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  config_schema: jsonb('config_schema'),
  widget_type: widgetTypeEnum('widget_type').notNull(),
  is_system: boolean('is_system').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const dashboards = pgTable('dashboards', {
  id: integer('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  is_default: boolean('is_default').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: integer('id').primaryKey().notNull(),
  dashboard_id: integer('dashboard_id').references(() => dashboards.id).notNull(),
  widget_type_id: integer('widget_type_id').references(() => widgetTypes.id).notNull(),
  title: text('title').notNull(),
  config: jsonb('config'),
  position_x: integer('position_x').default(0).notNull(),
  position_y: integer('position_y').default(0).notNull(),
  width: integer('width').default(1).notNull(),
  height: integer('height').default(1).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  email: true,
  password: true,
  role: true,
})

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  category_level1: true,
  category_level2: true,
  category_level3: true,
  created_by: true,
})

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  supplier_id: true,
  created_by: true,
  status: true,
  category_level1: true,
  category_level2: true,
  category_level3: true,
  objectives: true,
  initial_offer: true,
})

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiation_id: true,
  sender_id: true,
  sender_type: true,
  message_type: true,
  content: true,
  related_entity_id: true,
  file_path: true,
  file_name: true,
  is_visible_to_supplier: true,
})

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiation_id: true,
  supplier_id: true,
  token: true,
  status: true,
  email_sent: true,
  expired_at: true,
})

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiation_id: true,
  creator_id: true,
  creator_type: true,
  status: true,
  price: true,
  terms: true,
  valid_until: true,
  is_visible_to_supplier: true,
})

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  content: true,
  created_by: true,
  category_level1: true,
  category_level2: true,
  category_level3: true,
})

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  negotiation_id: true,
  template_id: true,
  content: true,
  status: true,
  created_by: true,
  signed_at: true,
  start_date: true,
  end_date: true,
})

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  user_id: true,
  file_name: true,
  file_path: true,
  row_count: true,
  status: true,
  error_message: true,
})

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  upload_id: true,
  supplier_id: true,
  supplier_name: true,
  invoice_number: true,
  invoice_date: true,
  category_level1: true,
  category_level2: true,
  category_level3: true,
  amount: true,
  currency: true,
  description: true,
  item_code: true,
  quantity: true,
  unit_price: true,
  year: true,
  month: true,
})

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  user_id: true,
  name: true,
  api_type: true,
  credentials: true,
  status: true,
})

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  config_schema: true,
  widget_type: true,
  is_system: true,
})

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  user_id: true,
  name: true,
  is_default: true,
})

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboard_id: true,
  widget_type_id: true,
  title: true,
  config: true,
  position_x: true,
  position_y: true,
  width: true,
  height: true,
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
  suppliers: many(suppliers, { relationName: "userSuppliers" }),
  negotiations: many(negotiations, { relationName: "userNegotiations" }),
  contractTemplates: many(contractTemplates, { relationName: "userContractTemplates" }),
  contracts: many(contracts, { relationName: "userContracts" }),
  spendUploads: many(spendUploads, { relationName: "userSpendUploads" }),
  apiConnections: many(apiConnections, { relationName: "userApiConnections" }),
  dashboards: many(dashboards, { relationName: "userDashboards" }),
}))

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  negotiations: many(negotiations, { relationName: "supplierNegotiations" }),
  invitations: many(invitations, { relationName: "supplierInvitations" }),
  spendData: many(spendData, { relationName: "supplierSpendData" }),
  creator: one(users, {
    fields: [suppliers.created_by],
    references: [users.id],
    relationName: "userSuppliers",
  }),
}))

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplier_id],
    references: [suppliers.id],
    relationName: "supplierNegotiations",
  }),
  creator: one(users, {
    fields: [negotiations.created_by],
    references: [users.id],
    relationName: "userNegotiations",
  }),
  messages: many(messages, { relationName: "negotiationMessages" }),
  invitations: many(invitations, { relationName: "negotiationInvitations" }),
  proposals: many(proposals, { relationName: "negotiationProposals" }),
  contracts: many(contracts, { relationName: "negotiationContracts" }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiation_id],
    references: [negotiations.id],
    relationName: "negotiationMessages",
  }),
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
    relationName: "userMessages",
  }),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiation_id],
    references: [negotiations.id],
    relationName: "negotiationInvitations",
  }),
  supplier: one(suppliers, {
    fields: [invitations.supplier_id],
    references: [suppliers.id],
    relationName: "supplierInvitations",
  }),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiation_id],
    references: [negotiations.id],
    relationName: "negotiationProposals",
  }),
  creator: one(users, {
    fields: [proposals.creator_id],
    references: [users.id],
    relationName: "userProposals",
  }),
}))

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [contractTemplates.created_by],
    references: [users.id],
    relationName: "userContractTemplates",
  }),
  contracts: many(contracts, { relationName: "templateContracts" }),
}))

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiation_id],
    references: [negotiations.id],
    relationName: "negotiationContracts",
  }),
  template: one(contractTemplates, {
    fields: [contracts.template_id],
    references: [contractTemplates.id],
    relationName: "templateContracts",
  }),
  creator: one(users, {
    fields: [contracts.created_by],
    references: [users.id],
    relationName: "userContracts",
  }),
}))

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.user_id],
    references: [users.id],
    relationName: "userSpendUploads",
  }),
  spendData: many(spendData, { relationName: "uploadSpendData" }),
}))

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.upload_id],
    references: [spendUploads.id],
    relationName: "uploadSpendData",
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplier_id],
    references: [suppliers.id],
    relationName: "supplierSpendData",
  }),
}))

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, {
    fields: [apiConnections.user_id],
    references: [users.id],
    relationName: "userApiConnections",
  }),
}))

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.user_id],
    references: [users.id],
    relationName: "userDashboards",
  }),
  widgets: many(dashboardWidgets, { relationName: "dashboardWidgets" }),
}))

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboard_id],
    references: [dashboards.id],
    relationName: "dashboardWidgets",
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widget_type_id],
    references: [widgetTypes.id],
    relationName: "widgetTypeInstances",
  }),
}))

export const widgetTypesRelations = relations(widgetTypes, ({ many }) => ({
  instances: many(dashboardWidgets, { relationName: "widgetTypeInstances" }),
}))