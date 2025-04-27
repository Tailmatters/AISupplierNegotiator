import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  date,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  contactPerson: varchar('contact_person', { length: 100 }),
  category: varchar('category', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
});

// Negotiations table
export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  category: varchar('category', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 })
    .notNull()
    .default('pending'),
  targetSavings: real('target_savings'),
  initialOffer: real('initial_offer'),
  currentOffer: real('current_offer'),
  finalOffer: real('final_offer'),
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  objectives: jsonb('objectives'),
  analysis: jsonb('analysis'),
  pastDataUrl: varchar('past_data_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id')
    .notNull()
    .references(() => negotiations.id),
  senderId: integer('sender_id').references(() => users.id),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // 'user', 'supplier', 'ai'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  attachmentUrl: varchar('attachment_url', { length: 255 }),
});

// Invitations table
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id')
    .notNull()
    .references(() => negotiations.id),
  token: varchar('token', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('pending'), // 'pending', 'accepted', 'declined'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Contract Templates table
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
});

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id')
    .notNull()
    .references(() => negotiations.id),
  templateId: integer('template_id').references(() => contractTemplates.id),
  name: varchar('name', { length: 100 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('draft'), // 'draft', 'pending', 'signed', 'expired'
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
});

// Proposals table
export const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id')
    .notNull()
    .references(() => negotiations.id),
  amount: real('amount').notNull(),
  content: text('content'),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('pending'), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  fileUrl: varchar('file_url', { length: 255 }),
});

// Spend Uploads table
export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('processing'), // 'processing', 'completed', 'error'
  rowCount: integer('row_count'),
  processedCount: integer('processed_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Spend Data table
export const spendData = pgTable('spend_data', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id').references(() => spendUploads.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  invoiceDate: date('invoice_date'),
  amount: real('amount').notNull(),
  description: text('description'),
  categoryLevel1: varchar('category_level1', { length: 100 }),
  categoryLevel2: varchar('category_level2', { length: 100 }),
  categoryLevel3: varchar('category_level3', { length: 100 }),
  year: integer('year'),
  month: integer('month'),
  createdAt: timestamp('created_at').defaultNow(),
});

// API Connections table
export const apiConnections = pgTable('api_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'erp', 'accounting', etc.
  config: jsonb('config').notNull(),
  active: boolean('active').default(true),
  lastSync: timestamp('last_sync'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Widget Types table
export const widgetTypes = pgTable('widget_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  configSchema: jsonb('config_schema'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Dashboards table
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Dashboard Widgets table
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id')
    .notNull()
    .references(() => dashboards.id),
  widgetTypeId: integer('widget_type_id')
    .notNull()
    .references(() => widgetTypes.id),
  title: varchar('title', { length: 100 }).notNull(),
  config: jsonb('config'),
  position: integer('position').notNull(),
  size: varchar('size', { length: 20 }).default('medium'), // 'small', 'medium', 'large'
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for inserting records
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  contactPerson: true,
  category: true,
  notes: true,
  createdBy: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).pick({
  supplierId: true,
  userId: true,
  category: true,
  status: true,
  targetSavings: true,
  initialOffer: true,
  currentOffer: true,
  finalOffer: true,
  startDate: true,
  endDate: true,
  objectives: true,
  analysis: true,
  pastDataUrl: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  negotiationId: true,
  senderId: true,
  senderType: true,
  content: true,
  attachmentUrl: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  negotiationId: true,
  token: true,
  email: true,
  status: true,
  expiresAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  negotiationId: true,
  amount: true,
  content: true,
  status: true,
  createdBy: true,
  fileUrl: true,
});

export const insertContractTemplateSchema = createInsertSchema(
  contractTemplates
).pick({
  name: true,
  category: true,
  content: true,
  createdBy: true,
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  negotiationId: true,
  templateId: true,
  name: true,
  content: true,
  status: true,
  startDate: true,
  endDate: true,
  createdBy: true,
});

export const insertSpendUploadSchema = createInsertSchema(spendUploads).pick({
  userId: true,
  fileName: true,
  fileUrl: true,
  status: true,
  rowCount: true,
});

export const insertSpendDataSchema = createInsertSchema(spendData).pick({
  uploadId: true,
  supplierId: true,
  invoiceNumber: true,
  invoiceDate: true,
  amount: true,
  description: true,
  categoryLevel1: true,
  categoryLevel2: true,
  categoryLevel3: true,
  year: true,
  month: true,
});

export const insertApiConnectionSchema = createInsertSchema(
  apiConnections
).pick({
  userId: true,
  name: true,
  type: true,
  config: true,
  active: true,
});

export const insertWidgetTypeSchema = createInsertSchema(widgetTypes).pick({
  name: true,
  description: true,
  icon: true,
  configSchema: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  isDefault: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(
  dashboardWidgets
).pick({
  dashboardId: true,
  widgetTypeId: true,
  title: true,
  config: true,
  position: true,
  size: true,
});

// TypeScript types based on the Zod schemas
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

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  contracts: many(contracts),
  spendUploads: many(spendUploads),
  apiConnections: many(apiConnections),
  dashboards: many(dashboards),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  negotiations: many(negotiations),
  spendData: many(spendData),
}));

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
  invitations: many(invitations),
  proposals: many(proposals),
  contracts: many(contracts),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiationId],
    references: [negotiations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [invitations.negotiationId],
    references: [negotiations.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [proposals.negotiationId],
    references: [negotiations.id],
  }),
  createdByUser: one(users, {
    fields: [proposals.createdBy],
    references: [users.id],
  }),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
  }),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
  createdByUser: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
  }),
}));

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.userId],
    references: [users.id],
  }),
  spendData: many(spendData),
}));

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
  }),
  supplier: one(suppliers, {
    fields: [spendData.supplierId],
    references: [suppliers.id],
  }),
}));

export const apiConnectionsRelations = relations(apiConnections, ({ one }) => ({
  user: one(users, {
    fields: [apiConnections.userId],
    references: [users.id],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
  widgets: many(dashboardWidgets),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardWidgets.dashboardId],
    references: [dashboards.id],
  }),
  widgetType: one(widgetTypes, {
    fields: [dashboardWidgets.widgetTypeId],
    references: [widgetTypes.id],
  }),
}));