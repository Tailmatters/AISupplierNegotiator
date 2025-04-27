import { pgTable, serial, text, integer, timestamp, boolean, pgEnum, doublePrecision, jsonb, foreignKey, date, varchar, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier']);
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined']);
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'active', 'completed', 'cancelled']);
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'countered']);
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'active', 'expired', 'terminated']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'proposal', 'contract', 'file']);
export const widgetTypeEnum = pgEnum('widget_type', ['spend_summary', 'supplier_chart', 'category_breakdown', 'negotiation_status', 'savings_trend', 'custom']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  email: text('email'),
  role: roleEnum('role').default('buyer'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  last_login: timestamp('last_login'),
  avatar_url: text('avatar_url'),
  preferences: jsonb('preferences'),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  description: text('description'),
  logo_url: text('logo_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  primary_contact: text('primary_contact'),
  tags: text('tags').array(),
  is_active: boolean('is_active').default(true),
  performance_rating: integer('performance_rating'),
  category: text('category'),
});

export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  status: negotiationStatusEnum('status').default('draft'),
  supplier_id: integer('supplier_id').references(() => suppliers.id),
  created_by: integer('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  objectives: jsonb('objectives'),
  initial_offer: doublePrecision('initial_offer'),
  final_offer: doublePrecision('final_offer'),
  target_savings: doublePrecision('target_savings'),
  actual_savings: doublePrecision('actual_savings'),
  completion_date: timestamp('completion_date'),
  past_data: text('past_data'),
  ai_summary: text('ai_summary'),
  is_public: boolean('is_public').default(false),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id),
  sender_id: integer('sender_id').references(() => users.id),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text'),
  created_at: timestamp('created_at').defaultNow(),
  attachment_url: text('attachment_url'),
  metadata: jsonb('metadata'),
  is_from_ai: boolean('is_from_ai').default(false),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  status: invitationStatusEnum('status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  expires_at: timestamp('expires_at'),
  created_by: integer('created_by').references(() => users.id),
  supplier_id: integer('supplier_id').references(() => suppliers.id),
  message: text('message'),
});

export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  created_by: integer('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  is_default: boolean('is_default').default(false),
  metadata: jsonb('metadata'),
  version: integer('version').default(1),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id),
  template_id: integer('template_id').references(() => contractTemplates.id),
  supplier_id: integer('supplier_id').references(() => suppliers.id),
  created_by: integer('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  status: contractStatusEnum('status').default('draft'),
  effective_date: date('effective_date'),
  expiry_date: date('expiry_date'),
  value: doublePrecision('value'),
  signed_url: text('signed_url'),
  metadata: jsonb('metadata'),
});

export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiation_id: integer('negotiation_id').references(() => negotiations.id),
  created_by: integer('created_by').references(() => users.id),
  content: text('content').notNull(),
  price: doublePrecision('price'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  status: proposalStatusEnum('status').default('draft'),
  valid_until: date('valid_until'),
  attachment_url: text('attachment_url'),
  metadata: jsonb('metadata'),
  previous_proposal_id: integer('previous_proposal_id'),
});

export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  filename: text('filename').notNull(),
  upload_date: timestamp('upload_date').defaultNow(),
  status: text('status').default('processing'),
  row_count: integer('row_count'),
  file_url: text('file_url'),
  metadata: jsonb('metadata'),
});

export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  upload_id: integer('upload_id').references(() => spendUploads.id),
  supplier_id: integer('supplier_id').references(() => suppliers.id),
  invoice_date: date('invoice_date'),
  invoice_number: text('invoice_number'),
  amount: doublePrecision('amount').notNull(),
  description: text('description'),
  category_level1: text('category_level1'),
  category_level2: text('category_level2'),
  category_level3: text('category_level3'),
  department: text('department'),
  cost_center: text('cost_center'),
  uploaded_by: integer('uploaded_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
});

export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  api_type: text('api_type').notNull(),
  credentials: jsonb('credentials'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  last_sync: timestamp('last_sync'),
  is_active: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
});

export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: widgetTypeEnum('type').notNull(),
  config_schema: jsonb('config_schema'),
  created_at: timestamp('created_at').defaultNow(),
  icon: text('icon'),
  is_default: boolean('is_default').default(false),
});

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  user_id: integer('user_id').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  is_default: boolean('is_default').default(false),
  layout_config: jsonb('layout_config'),
  description: text('description'),
});

export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboard_id: integer('dashboard_id').references(() => dashboards.id),
  widget_type_id: integer('widget_type_id').references(() => widgetTypes.id),
  position: integer('position'),
  size: text('size'),
  title: text('title'),
  config: jsonb('config'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  password: true,
  email: true,
  role: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  description: true,
  logo_url: true,
  created_by: true,
  primary_contact: true,
  tags: true,
  is_active: true,
  category: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  title: true,
  description: true,
  category: true,
  status: true,
  supplier_id: true,
  created_by: true,
  objectives: true,
  initial_offer: true,
  target_savings: true,
  past_data: true,
  is_public: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiation_id: true,
  sender_id: true,
  content: true,
  type: true,
  attachment_url: true,
  metadata: true,
  is_from_ai: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiation_id: true,
  email: true,
  token: true,
  status: true,
  expires_at: true,
  created_by: true,
  supplier_id: true,
  message: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiation_id: true,
  created_by: true,
  content: true,
  price: true,
  status: true,
  valid_until: true,
  attachment_url: true,
  metadata: true,
  previous_proposal_id: true,
});

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).pick({
  name: true,
  content: true,
  category: true,
  created_by: true,
  is_default: true,
  metadata: true,
  version: true,
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  content: true,
  negotiation_id: true,
  template_id: true,
  supplier_id: true,
  created_by: true,
  status: true,
  effective_date: true,
  expiry_date: true,
  value: true,
  signed_url: true,
  metadata: true,
});

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  user_id: true,
  filename: true,
  status: true,
  row_count: true,
  file_url: true,
  metadata: true,
});

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  upload_id: true,
  supplier_id: true,
  invoice_date: true,
  invoice_number: true,
  amount: true,
  description: true,
  category_level1: true,
  category_level2: true,
  category_level3: true,
  department: true,
  cost_center: true,
  uploaded_by: true,
});

export const insertApiConnectionSchema = createInsertSchema(apiConnections).pick({
  user_id: true,
  name: true,
  api_type: true,
  credentials: true,
  is_active: true,
  metadata: true,
});

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  type: true,
  config_schema: true,
  icon: true,
  is_default: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  user_id: true,
  is_default: true,
  layout_config: true,
  description: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboard_id: true,
  widget_type_id: true,
  position: true,
  size: true,
  title: true,
  config: true,
});

// Type Definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type Negotiation = typeof negotiations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type ContractTemplate = typeof contractTemplates.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertSpendUpload = z.infer<typeof insertSpendUploadSchema>;
export type SpendUpload = typeof spendUploads.$inferSelect;

export type InsertSpendData = z.infer<typeof insertSpendDataSchema>;
export type SpendData = typeof spendData.$inferSelect;

export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>;
export type ApiConnection = typeof apiConnections.$inferSelect;

export type InsertWidgetType = z.infer<typeof insertWidgetTypeSchema>;
export type WidgetType = typeof widgetTypes.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

// Table Relations
export const usersRelations = relations(users, ({ many }) => ({
  negotiations: many(negotiations),
  spendUploads: many(spendUploads),
  dashboards: many(dashboards),
  messages: many(messages),
  invitations: many(invitations),
  apiConnections: many(apiConnections),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  negotiations: many(negotiations),
  contracts: many(contracts),
  spendData: many(spendData),
  invitations: many(invitations),
}));

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [negotiations.supplier_id],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [negotiations.created_by],
    references: [users.id],
  }),
  messages: many(messages),
  invitations: many(invitations),
  proposals: many(proposals),
  contracts: many(contracts),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiation_id],
    references: [negotiations.id],
  }),
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiation_id],
    references: [negotiations.id],
  }),
  createdBy: one(users, {
    fields: [invitations.created_by],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [invitations.supplier_id],
    references: [suppliers.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiation_id],
    references: [negotiations.id],
  }),
  createdBy: one(users, {
    fields: [proposals.created_by],
    references: [users.id],
  }),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [contractTemplates.created_by],
    references: [users.id],
  }),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiation_id],
    references: [negotiations.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.template_id],
    references: [contractTemplates.id],
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplier_id],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [contracts.created_by],
    references: [users.id],
  }),
}));

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.user_id],
    references: [users.id],
  }),
  spendData: many(spendData),
}));

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.upload_id],
    references: [spendUploads.id],
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplier_id],
    references: [suppliers.id],
  }),
  uploadedBy: one(users, {
    fields: [spendData.uploaded_by],
    references: [users.id],
  }),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, {
    fields: [apiConnections.user_id],
    references: [users.id],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.user_id],
    references: [users.id],
  }),
  widgets: many(dashboardWidgets),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboard_id],
    references: [dashboards.id],
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widget_type_id],
    references: [widgetTypes.id],
  }),
}));