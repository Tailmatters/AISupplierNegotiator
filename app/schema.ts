import { pgTable, serial, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

// Constants for user roles
export const USER_ROLES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SUPPLIER: "supplier",
  VIEWER: "viewer",
} as const

// User role enum
export const roleEnum = pgEnum("role", [
  USER_ROLES.ADMIN,
  USER_ROLES.BUYER,
  USER_ROLES.SUPPLIER,
  USER_ROLES.VIEWER,
])

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default(USER_ROLES.BUYER),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Categories table schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: integer("parent_id").references(() => categories.id),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Suppliers table schema
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  contactName: varchar("contact_name", { length: 255 }),
  website: varchar("website", { length: 255 }),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Negotiations table schema
export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  objectives: text("objectives").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  invitationToken: varchar("invitation_token", { length: 255 }),
  invitationExpires: timestamp("invitation_expires"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  aiRating: integer("ai_rating"),
  aiRationale: text("ai_rationale"),
  pastDataUrl: varchar("past_data_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Messages table schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 255 }),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

// Contract templates table schema
export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Contracts table schema
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id),
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Spend data uploads table schema
export const spendUploads = pgTable("spend_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("processing"),
  recordCount: integer("record_count"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Spend data table schema
export const spendData = pgTable("spend_data", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => spendUploads.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  categoryId: integer("category_id").references(() => categories.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  date: timestamp("date").notNull(),
  description: varchar("description", { length: 255 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  poNumber: varchar("po_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
})

// Dashboard widgets table schema
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  config: text("config").notNull(),
  position: integer("position").notNull(),
  size: varchar("size", { length: 50 }).notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Market analysis table schema
export const marketAnalysis = pgTable("market_analysis", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  supplierPower: integer("supplier_power").notNull(),
  buyerPower: integer("buyer_power").notNull(),
  competitionLevel: integer("competition_level").notNull(),
  newEntrantThreat: integer("new_entrant_threat").notNull(),
  substitutionThreat: integer("substitution_threat").notNull(),
  analysis: text("analysis").notNull(),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Export types for use in the application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Supplier = typeof suppliers.$inferSelect
export type NewSupplier = typeof suppliers.$inferInsert
export type Negotiation = typeof negotiations.$inferSelect
export type NewNegotiation = typeof negotiations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type ContractTemplate = typeof contractTemplates.$inferSelect
export type NewContractTemplate = typeof contractTemplates.$inferInsert
export type Contract = typeof contracts.$inferSelect
export type NewContract = typeof contracts.$inferInsert
export type SpendUpload = typeof spendUploads.$inferSelect
export type NewSpendUpload = typeof spendUploads.$inferInsert
export type SpendEntry = typeof spendData.$inferSelect
export type NewSpendEntry = typeof spendData.$inferInsert
export type DashboardWidget = typeof dashboardWidgets.$inferSelect
export type NewDashboardWidget = typeof dashboardWidgets.$inferInsert
export type MarketAnalysis = typeof marketAnalysis.$inferSelect
export type NewMarketAnalysis = typeof marketAnalysis.$inferInsert

// Create Zod schemas for validation

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    USER_ROLES.ADMIN, 
    USER_ROLES.BUYER, 
    USER_ROLES.SUPPLIER, 
    USER_ROLES.VIEWER
  ]),
}).omit({ id: true, createdAt: true, updatedAt: true })

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const updateUserSchema = createSelectSchema(users, {
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
}).omit({ password: true, createdAt: true, updatedAt: true })

// Negotiation schemas
export const insertNegotiationSchema = createInsertSchema(negotiations, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  objectives: z.string().min(10, "Objectives must be at least 10 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true, aiRating: true, aiRationale: true })

export const updateNegotiationSchema = createSelectSchema(negotiations, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  objectives: z.string().min(10, "Objectives must be at least 10 characters"),
}).omit({ createdAt: true, invitationToken: true, invitationExpires: true })

// Contract schemas
export const insertContractTemplateSchema = createInsertSchema(contractTemplates, {
  name: z.string().min(3, "Name must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true })

export const insertContractSchema = createInsertSchema(contracts, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true, approvedAt: true })

// Message schema
export const insertMessageSchema = createInsertSchema(messages, {
  content: z.string().min(1, "Message cannot be empty"),
}).omit({ id: true, createdAt: true })

// Supplier schema
export const insertSupplierSchema = createInsertSchema(suppliers, {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
}).omit({ id: true, createdAt: true, updatedAt: true })

// Widget schema
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets, {
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.string().min(2, "Type must be at least 2 characters"),
  config: z.string().min(2, "Configuration must be at least 2 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true })

// Market analysis schema
export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  supplierPower: z.number().min(1).max(5),
  buyerPower: z.number().min(1).max(5),
  competitionLevel: z.number().min(1).max(5),
  newEntrantThreat: z.number().min(1).max(5),
  substitutionThreat: z.number().min(1).max(5),
  analysis: z.string().min(10, "Analysis must be at least 10 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true })

// Export insert schemas as types
export type InsertUser = z.infer<typeof insertUserSchema>
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>
export type InsertContract = z.infer<typeof insertContractSchema>
export type InsertMessage = z.infer<typeof insertMessageSchema>
export type InsertSupplier = z.infer<typeof insertSupplierSchema>
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>
export type InsertMarketAnalysis = z.infer<typeof insertMarketAnalysisSchema>
// Create schema before inference
const spendUploadSchema = createInsertSchema(spendUploads)
const spendDataSchema = createInsertSchema(spendData)

export type InsertSpendUpload = z.infer<typeof spendUploadSchema>
export type InsertSpendEntry = z.infer<typeof spendDataSchema>