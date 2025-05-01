import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  json,
  boolean,
  serial,
  real,
  unique,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const USER_ROLES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SUPPLIER: "supplier",
};

export const roleEnum = pgEnum("role", [
  USER_ROLES.ADMIN,
  USER_ROLES.BUYER,
  USER_ROLES.SUPPLIER,
]);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default(USER_ROLES.BUYER),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => categories.id),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  primaryContact: text("primary_contact"),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"),
  categoryId: integer("category_id").references(() => categories.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  createdById: integer("created_by_id").references(() => users.id),
  objectives: json("objectives"),
  pastDataPath: text("past_data_path"),
  invitationToken: text("invitation_token"),
  invitationSent: boolean("invitation_sent").default(false),
  invitationAccepted: boolean("invitation_accepted").default(false),
  savingsTarget: real("savings_target"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id")
    .references(() => negotiations.id)
    .notNull(),
  senderId: integer("sender_id").references(() => users.id),
  isAi: boolean("is_ai").default(false),
  content: text("content").notNull(),
  attachmentPath: text("attachment_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  content: text("content").notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  negotiationId: integer("negotiation_id").references(() => negotiations.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  templateId: integer("template_id").references(() => contractTemplates.id),
  content: text("content").notNull(),
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  signedById: integer("signed_by_id").references(() => users.id),
  signedAt: timestamp("signed_at"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spendUploads = pgTable("spend_uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  processingStatus: text("processing_status").notNull().default("pending"),
  rowCount: integer("row_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spendData = pgTable("spend_data", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => spendUploads.id),
  date: timestamp("date").notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  categoryLevel1: text("category_level1"),
  categoryLevel2: text("category_level2"),
  categoryLevel3: text("category_level3"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  invoiceNumber: text("invoice_number"),
  poNumber: text("po_number"),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  config: json("config"),
  position: integer("position").notNull(),
  size: text("size").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketAnalysis = pgTable("market_analysis", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  title: text("title").notNull(),
  portersFiveForces: json("porters_five_forces"),
  swotAnalysis: json("swot_analysis"),
  marketTrends: json("market_trends"),
  generatedById: integer("generated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relation definitions
export const usersRelations = relations(users, ({ many }) => ({
  suppliers: many(suppliers),
  negotiations: many(negotiations, { relationName: "createdNegotiations" }),
  contractTemplates: many(contractTemplates),
  spendUploads: many(spendUploads),
  dashboardWidgets: many(dashboardWidgets),
  marketAnalysis: many(marketAnalysis),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  subcategories: many(categories),
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
  category: one(categories, {
    fields: [negotiations.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [negotiations.supplierId],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [negotiations.createdById],
    references: [users.id],
    relationName: "createdNegotiations",
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
  createdBy: one(users, {
    fields: [contractTemplates.createdById],
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
  approvedBy: one(users, {
    fields: [contracts.approvedById],
    references: [users.id],
  }),
  signedBy: one(users, {
    fields: [contracts.signedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [contracts.createdById],
    references: [users.id],
  }),
}));

export const spendUploadsRelations = relations(spendUploads, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [spendUploads.uploadedById],
    references: [users.id],
  }),
  spendData: many(spendData),
}));

export const spendDataRelations = relations(spendData, ({ one }) => ({
  upload: one(spendUploads, {
    fields: [spendData.uploadId],
    references: [spendUploads.id],
  }),
  category: one(categories, {
    fields: [spendData.categoryId],
    references: [categories.id],
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
  generatedBy: one(users, {
    fields: [marketAnalysis.generatedById],
    references: [users.id],
  }),
}));

// Type definitions
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
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.BUYER, USER_ROLES.SUPPLIER]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = createSelectSchema(users, {
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  email: z.string().email("Invalid email address"),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.BUYER, USER_ROLES.SUPPLIER]),
}).omit({ id: true });

export const insertNegotiationSchema = createInsertSchema(negotiations, {
  objectives: z.record(z.string(), z.any()).optional(),
}).omit({ id: true });

export const updateNegotiationSchema = createSelectSchema(negotiations, {
  objectives: z.record(z.string(), z.any()).optional(),
}).omit({ id: true });

export const insertContractTemplateSchema = createInsertSchema(contractTemplates, {
}).omit({ id: true });

export const insertContractSchema = createInsertSchema(contracts, {
}).omit({ id: true });

export const insertMessageSchema = createInsertSchema(messages, {
}).omit({ id: true });

export const insertSupplierSchema = createInsertSchema(suppliers, {
  email: z.string().email("Invalid email address"),
}).omit({ id: true });

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets, {
  config: z.record(z.string(), z.any()).optional(),
}).omit({ id: true });

export const insertMarketAnalysisSchema = createInsertSchema(marketAnalysis, {
  portersFiveForces: z.record(z.string(), z.any()).optional(),
  swotAnalysis: z.record(z.string(), z.any()).optional(),
  marketTrends: z.record(z.string(), z.any()).optional(),
}).omit({ id: true });

// Zod schema types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type InsertMarketAnalysis = z.infer<typeof insertMarketAnalysisSchema>;

// For spend data
export const spendUploadSchema = createInsertSchema(spendUploads).omit({ id: true });
export const spendDataSchema = createInsertSchema(spendData).omit({ id: true });

export type InsertSpendUpload = z.infer<typeof spendUploadSchema>;
export type InsertSpendEntry = z.infer<typeof spendDataSchema>;