import { pgTable, pgEnum, serial, varchar, text, timestamp, integer, boolean, smallint, pgSchema, jsonb, numeric, unique, foreignKey } from 'drizzle-orm/pg-core'
import { InferSelectModel, relations } from 'drizzle-orm'
import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'

// Enums
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier'])
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'pending', 'active', 'expired', 'cancelled'])
export const negotiationStatusEnum = pgEnum('negotiation_status', ['draft', 'pending', 'active', 'completed', 'cancelled'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'file', 'proposal'])

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('buyer'),
  companyName: varchar('company_name', { length: 255 }),
  title: varchar('title', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  categories: many(categories),
  negotiations: many(negotiations),
  contracts: many(contracts),
  dashboardWidgets: many(dashboardWidgets),
}))

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  contactName: varchar('contact_name', { length: 255 }),
  contactTitle: varchar('contact_title', { length: 255 }),
  website: varchar('website', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id],
  }),
  negotiations: many(negotiations),
  spendItems: many(spendItems),
}))

// Categories table (hierarchical)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: integer('parent_id').references((): any => categories.id),
  level: smallint('level').notNull().default(1),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  negotiations: many(negotiations),
  contracts: many(contracts),
  spendItems: many(spendItems),
}))

// Negotiations table
export const negotiations = pgTable('negotiations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  objectives: jsonb('objectives').notNull(),
  status: negotiationStatusEnum('status').notNull().default('draft'),
  invitationToken: varchar('invitation_token', { length: 255 }),
  tokenExpiry: timestamp('token_expiry'),
  historicalData: jsonb('historical_data'),
  analysisResult: jsonb('analysis_result'),
  porterAnalysis: jsonb('porter_analysis'),
  aiPerformance: smallint('ai_performance'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  user: one(users, {
    fields: [negotiations.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  category: one(categories, {
    fields: [negotiations.categoryId],
    references: [categories.id],
  }),
  messages: many(messages),
  contract: many(contracts),
}))

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id).notNull(),
  sender: varchar('sender', { length: 50 }).notNull(), // 'ai', 'buyer', 'supplier'
  content: text('content').notNull(),
  type: messageTypeEnum('type').notNull().default('text'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const messagesRelations = relations(messages, ({ one }) => ({
  negotiation: one(negotiations, {
    fields: [messages.negotiationId],
    references: [negotiations.id],
  }),
}))

// Contract templates table
export const contractTemplates = pgTable('contract_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  variables: jsonb('variables'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [contractTemplates.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [contractTemplates.categoryId],
    references: [categories.id],
  }),
  contracts: many(contracts),
}))

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  negotiationId: integer('negotiation_id').references(() => negotiations.id),
  templateId: integer('template_id').references(() => contractTemplates.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: contractStatusEnum('status').notNull().default('draft'),
  effectiveDate: timestamp('effective_date'),
  expirationDate: timestamp('expiration_date'),
  value: numeric('value', { precision: 10, scale: 2 }),
  termsData: jsonb('terms_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contractsRelations = relations(contracts, ({ one }) => ({
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
  }),
  category: one(categories, {
    fields: [contracts.categoryId],
    references: [categories.id],
  }),
  negotiation: one(negotiations, {
    fields: [contracts.negotiationId],
    references: [negotiations.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
}))

// Spend data uploads table
export const spendUploads = pgTable('spend_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('processing'),
  totalRows: integer('total_rows'),
  processedRows: integer('processed_rows'),
  failedRows: integer('failed_rows'),
  source: varchar('source', { length: 100 }).notNull().default('csv'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
})

// Spend data table for spend analysis
export const spendItems = pgTable('spend_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  uploadId: integer('upload_id').references(() => spendUploads.id).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  date: timestamp('date').notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  poNumber: varchar('po_number', { length: 100 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  user: one(users, {
    fields: [spendUploads.userId],
    references: [users.id],
  }),
  spendItems: many(spendItems),
}))

export const spendItemsRelations = relations(spendItems, ({ one }) => ({
  user: one(users, {
    fields: [spendItems.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [spendItems.supplierId],
    references: [suppliers.id],
  }),
  category: one(categories, {
    fields: [spendItems.categoryId],
    references: [categories.id],
  }),
  upload: one(spendUploads, {
    fields: [spendItems.uploadId],
    references: [spendUploads.id],
  }),
}))

// Dashboard widgets table
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  position: smallint('position').notNull(),
  size: varchar('size', { length: 50 }).notNull().default('medium'),
  config: jsonb('config').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  user: one(users, {
    fields: [dashboardWidgets.userId],
    references: [users.id],
  }),
}))

// Type definitions
export type User = InferSelectModel<typeof users>
export type Supplier = InferSelectModel<typeof suppliers>
export type Category = InferSelectModel<typeof categories>
export type Negotiation = InferSelectModel<typeof negotiations>
export type Message = InferSelectModel<typeof messages>
export type ContractTemplate = InferSelectModel<typeof contractTemplates>
export type Contract = InferSelectModel<typeof contracts>
export type SpendItem = InferSelectModel<typeof spendItems>
export type SpendUpload = InferSelectModel<typeof spendUploads>
export type DashboardWidget = InferSelectModel<typeof dashboardWidgets>

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  // Add any additional validation here
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const insertSupplierSchema = createInsertSchema(suppliers)
export const insertCategorySchema = createInsertSchema(categories)
export const insertNegotiationSchema = createInsertSchema(negotiations)
export const insertMessageSchema = createInsertSchema(messages)
export const insertContractTemplateSchema = createInsertSchema(contractTemplates)
export const insertContractSchema = createInsertSchema(contracts)
export const insertSpendItemSchema = createInsertSchema(spendItems)
export const insertSpendUploadSchema = createInsertSchema(spendUploads)
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets)

// Export types for insert schemas
export type InsertUser = z.infer<typeof insertUserSchema>
export type InsertSupplier = z.infer<typeof insertSupplierSchema>
export type InsertCategory = z.infer<typeof insertCategorySchema>
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>
export type InsertMessage = z.infer<typeof insertMessageSchema>
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>
export type InsertContract = z.infer<typeof insertContractSchema>
export type InsertSpendItem = z.infer<typeof insertSpendItemSchema>
export type InsertSpendUpload = z.infer<typeof insertSpendUploadSchema>
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>