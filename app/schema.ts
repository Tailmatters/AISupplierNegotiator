import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  json,
  pgEnum,
  real,
  uniqueIndex,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define enums
export const USER_ROLES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SUPPLIER: "supplier",
} as const;

export const NEGOTIATION_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  WAITING: "waiting",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const CONTRACT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
} as const;

// Create Postgres enums
export const roleEnum = pgEnum("role", Object.values(USER_ROLES));
export const negotiationStatusEnum = pgEnum("negotiation_status", Object.values(NEGOTIATION_STATUS));
export const contractStatusEnum = pgEnum("contract_status", Object.values(CONTRACT_STATUS));

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  company: text("company"),
  role: roleEnum("role").default(USER_ROLES.BUYER),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table (3-level hierarchy)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => categories.id),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  contactName: text("contact_name"),
  address: text("address"),
  website: text("website"),
  categoryId: integer("category_id").references(() => categories.id),
  createdBy: integer("created_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Negotiations table
export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  createdBy: integer("created_by").references(() => users.id),
  status: negotiationStatusEnum("status").default(NEGOTIATION_STATUS.DRAFT),
  objectives: json("objectives").$type<{
    targetPrice?: number;
    targetQuantity?: number;
    timeframe?: string;
    specificRequirements?: string[];
  }>(),
  invitationToken: text("invitation_token").unique(),
  invitationSentAt: timestamp("invitation_sent_at"),
  invitationExpiry: timestamp("invitation_expiry"),
  completedAt: timestamp("completed_at"),
  outcome: json("outcome").$type<{
    success: boolean;
    agreedPrice?: number;
    agreedQuantity?: number;
    savingsPercentage?: number;
    nextSteps?: string;
  }>(),
  aiRating: integer("ai_rating"),
  aiRatingFeedback: text("ai_rating_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages within negotiations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id")
    .references(() => negotiations.id)
    .notNull(),
  senderId: integer("sender_id").references(() => users.id),
  senderType: text("sender_type").notNull(), // 'user', 'supplier', 'ai'
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contract templates
export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  content: text("content").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contracts
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  templateId: integer("template_id").references(() => contractTemplates.id),
  content: text("content").notNull(),
  status: contractStatusEnum("status").default(CONTRACT_STATUS.DRAFT),
  startDate: date("start_date"),
  endDate: date("end_date"),
  value: numeric("value", { precision: 10, scale: 2 }),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Spend data uploads
export const spendUploads = pgTable("spend_uploads", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  rowCount: integer("row_count"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual spend entries
export const spendData = pgTable("spend_data", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => spendUploads.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  categoryLevel1: text("category_level1"),
  categoryLevel2: text("category_level2"),
  categoryLevel3: text("category_level3"),
  description: text("description"),
  invoiceNumber: text("invoice_number"),
  invoiceDate: date("invoice_date"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  quantity: real("quantity"),
  unit: text("unit"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }),
  autoCategorized: boolean("auto_categorized").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dashboard widgets
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'spend', 'suppliers', 'negotiations', 'contracts', 'porters'
  title: text("title").notNull(),
  config: json("config").$type<{
    position: { x: number; y: number; w: number; h: number };
    filters?: Record<string, any>;
    visualization?: string;
    timeRange?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Market analysis (Porter's Five Forces)
export const marketAnalysis = pgTable("market_analysis", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  supplierPower: integer("supplier_power"), // 1-5 rating
  buyerPower: integer("buyer_power"), // 1-5 rating
  competitiveRivalry: integer("competitive_rivalry"), // 1-5 rating
  threatOfSubstitution: integer("threat_of_substitution"), // 1-5 rating
  threatOfNewEntry: integer("threat_of_new_entry"), // 1-5 rating
  supplierPowerNotes: text("supplier_power_notes"),
  buyerPowerNotes: text("buyer_power_notes"),
  competitiveRivalryNotes: text("competitive_rivalry_notes"),
  threatOfSubstitutionNotes: text("threat_of_substitution_notes"),
  threatOfNewEntryNotes: text("threat_of_new_entry_notes"),
  overallAssessment: text("overall_assessment"),
  suggestedStrategy: text("suggested_strategy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  contracts: many(contracts),
  spendUploads: many(spendUploads),
  dashboardWidgets: many(dashboardWidgets),
  marketAnalysis: many(marketAnalysis),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  suppliers: many(suppliers),
  negotiations: many(negotiations),
  contractTemplates: many(contractTemplates),
  spendData: many(spendData),
  marketAnalysis: many(marketAnalysis),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  category: one(categories, {
    fields: [suppliers.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
  }),
  negotiations: many(negotiations),
  contracts: many(contracts),
  spendData: many(spendData),
}));

export const negotiationsRelations = relations(negotiations, ({ one, many }) => ({
  category: one(categories, {
    fields: [negotiations.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  createdByUser: one(users, {
    fields: [negotiations.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
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

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  category: one(categories, {
    fields: [contractTemplates.categoryId],
    references: [categories.id],
  }),
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
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
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
  uploadedByUser: one(users, {
    fields: [spendUploads.uploadedBy],
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
  category: one(categories, {
    fields: [spendData.categoryId],
    references: [categories.id],
  }),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  user: one(users, {
    fields: [dashboardWidgets.userId],
    references: [users.id],
  }),
}));

export const marketAnalysisRelations = relations(marketAnalysis, ({ one }) => ({
  category: one(categories, {
    fields: [marketAnalysis.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [marketAnalysis.createdBy],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Negotiation = typeof negotiations.$inferSelect;
export type NewNegotiation = typeof negotiations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type NewContractTemplate = typeof contractTemplates.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type SpendUpload = typeof spendUploads.$inferSelect;
export type NewSpendUpload = typeof spendUploads.$inferInsert;
export type SpendEntry = typeof spendData.$inferSelect;
export type NewSpendEntry = typeof spendData.$inferInsert;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type NewDashboardWidget = typeof dashboardWidgets.$inferInsert;
export type MarketAnalysis = typeof marketAnalysis.$inferSelect;
export type NewMarketAnalysis = typeof marketAnalysis.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const updateUserSchema = createSelectSchema(users, {
  password: z.string().min(8).optional(),
}).omit({ id: true, createdAt: true, password: true });

export const insertNegotiationSchema = createInsertSchema(negotiations);
export const updateNegotiationSchema = createSelectSchema(negotiations).omit({ id: true, createdAt: true });

export const insertContractTemplateSchema = createInsertSchema(contractTemplates);
export const insertContractSchema = createInsertSchema(contracts);

export const insertMessageSchema = createInsertSchema(messages);
export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets);
export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis);

// Types for the schema validators
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type InsertMarketAnalysis = z.infer<typeof insertMarketAnalysisSchema>;

// Spend data schemas
export const spendUploadSchema = createInsertSchema(spendUploads).omit({ id: true });
export const spendDataSchema = createInsertSchema(spendData).omit({ id: true });

export type InsertSpendUpload = z.infer<typeof spendUploadSchema>;
export type InsertSpendEntry = z.infer<typeof spendDataSchema>;