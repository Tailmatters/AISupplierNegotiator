import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  json,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Enum definitions
 */
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

// Create Postgres enums for the status values
export const roleEnum = pgEnum("role", ["admin", "buyer", "supplier"]);
export const negotiationStatusEnum = pgEnum("negotiation_status", ["draft", "active", "waiting", "completed", "cancelled"]);
export const contractStatusEnum = pgEnum("contract_status", ["draft", "active", "expired", "terminated"]);

/**
 * Database tables
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"),
  role: roleEnum("role").default(USER_ROLES.BUYER).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  parentId: integer("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  status: negotiationStatusEnum("status").default(NEGOTIATION_STATUS.DRAFT).notNull(),
  objectives: json("objectives"),
  invitationToken: text("invitation_token"),
  pastData: json("past_data"),
  aiAnalysis: json("ai_analysis"),
  finalSavings: decimal("final_savings", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  isSystemMessage: boolean("is_system_message").default(false),
  attachment: text("attachment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateId: integer("template_id").references(() => contractTemplates.id),
  status: contractStatusEnum("status").default(CONTRACT_STATUS.DRAFT).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  value: decimal("value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spendUploads = pgTable("spend_uploads", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalRows: integer("total_rows"),
  processedRows: integer("processed_rows"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spendData = pgTable("spend_data", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => spendUploads.id).notNull(),
  invoiceNumber: text("invoice_number"),
  date: date("date").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  categoryLevel1: text("category_level_1"),
  categoryLevel2: text("category_level_2"),
  categoryLevel3: text("category_level_3"),
  notes: text("notes"),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  settings: json("settings"),
  position: integer("position"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketAnalysis = pgTable("market_analysis", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  supplierPower: json("supplier_power"),
  buyerPower: json("buyer_power"),
  competitiveRivalry: json("competitive_rivalry"),
  substituteThreat: json("substitute_threat"),
  newEntrantThreat: json("new_entrant_threat"),
  summary: text("summary"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Table relations
 */
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
  marketAnalysis: many(marketAnalysis),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [suppliers.categoryId],
    references: [categories.id],
  }),
  negotiations: many(negotiations),
  contracts: many(contracts),
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
  category: one(categories, {
    fields: [negotiations.categoryId],
    references: [categories.id],
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
  user: one(users, {
    fields: [contractTemplates.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [contractTemplates.categoryId],
    references: [categories.id],
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
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
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
  user: one(users, {
    fields: [marketAnalysis.userId],
    references: [users.id],
  }),
}));

/**
 * Types
 */
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

/**
 * Schemas for validation
 */
export const insertUserSchema = createInsertSchema(users, {
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.BUYER, USER_ROLES.SUPPLIER]),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const updateUserSchema = createSelectSchema(users, {
  password: z.string().min(8).optional(),
}).omit({ id: true });

export const insertNegotiationSchema = createInsertSchema(negotiations);
export const updateNegotiationSchema = createSelectSchema(negotiations).omit({ id: true, createdAt: true });

export const insertContractTemplateSchema = createInsertSchema(contractTemplates);
export const insertContractSchema = createInsertSchema(contracts);

export const insertMessageSchema = createInsertSchema(messages);
export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets);
export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis);

export const spendUploadSchema = createInsertSchema(spendUploads).omit({ id: true });
export const spendDataSchema = createInsertSchema(spendData).omit({ id: true });

/**
 * Export types for insert schemas
 */
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type InsertMarketAnalysis = z.infer<typeof insertMarketAnalysisSchema>;
export type InsertSpendUpload = z.infer<typeof spendUploadSchema>;
export type InsertSpendEntry = z.infer<typeof spendDataSchema>;