import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
  json,
  date,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define enums for role types
export const USER_ROLES = {
  ADMIN: "admin",
  PROCUREMENT: "procurement",
  SUPPLIER: "supplier",
} as const;

export const roleEnum = pgEnum("role", [
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT,
  USER_ROLES.SUPPLIER,
]);

// Table definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default(USER_ROLES.PROCUREMENT).notNull(),
  company: varchar("company", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: integer("parent_id").references(() => categories.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  objectives: json("objectives"),
  invitationToken: varchar("invitation_token", { length: 255 }),
  invitationSentAt: timestamp("invitation_sent_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  result: json("result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  isAi: boolean("is_ai").default(false).notNull(),
  content: text("content").notNull(),
  attachment: varchar("attachment", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  negotiationId: integer("negotiation_id").references(() => negotiations.id),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  templateId: integer("template_id").references(() => contractTemplates.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  value: decimal("value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spendUploads = pgTable("spend_uploads", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 50 }).default("processing").notNull(),
  totalRows: integer("total_rows"),
  processedRows: integer("processed_rows"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const spendData = pgTable("spend_data", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => spendUploads.id).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  invoiceDate: date("invoice_date"),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  supplierName: varchar("supplier_name", { length: 255 }),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  categoryL1: varchar("category_l1", { length: 255 }),
  categoryL2: varchar("category_l2", { length: 255 }),
  categoryL3: varchar("category_l3", { length: 255 }),
  categoryId: integer("category_id").references(() => categories.id),
  year: integer("year"),
  month: integer("month"),
  quarter: integer("quarter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  config: json("config"),
  position: integer("position").notNull(),
  size: varchar("size", { length: 20 }).default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketAnalysis = pgTable("market_analysis", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  analysisType: varchar("analysis_type", { length: 50 }).default("porters").notNull(),
  result: json("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
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
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id],
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
  category: one(categories, {
    fields: [negotiations.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [negotiations.userId],
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
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  category: one(categories, {
    fields: [contractTemplates.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [contractTemplates.userId],
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
  user: one(users, {
    fields: [contracts.userId],
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
  user: one(users, {
    fields: [marketAnalysis.userId],
    references: [users.id],
  }),
}));

// Types
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

// Zod schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT, USER_ROLES.SUPPLIER]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = createSelectSchema(users, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
}).omit({ id: true, createdAt: true });

export const insertNegotiationSchema = createInsertSchema(negotiations);
export const updateNegotiationSchema = createSelectSchema(negotiations).omit({ id: true, createdAt: true });

export const insertContractTemplateSchema = createInsertSchema(contractTemplates);
export const insertContractSchema = createInsertSchema(contracts);

export const insertMessageSchema = createInsertSchema(messages);
export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets);
export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis);

// Exported type aliases
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type InsertMarketAnalysis = z.infer<typeof insertMarketAnalysisSchema>;

// Additional schemas for features
export const spendUploadSchema = createInsertSchema(spendUploads).omit({ id: true });
export const spendDataSchema = createInsertSchema(spendData).omit({ id: true });

export type InsertSpendUpload = z.infer<typeof spendUploadSchema>;
export type InsertSpendEntry = z.infer<typeof spendDataSchema>;