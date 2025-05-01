import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

// User roles enum
export const USER_ROLES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SUPPLIER: "supplier",
} as const

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default(USER_ROLES.BUYER),
  company: varchar("company", { length: 255 }),
  title: varchar("title", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Type definitions
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.BUYER, USER_ROLES.SUPPLIER]),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const updateUserSchema = createSelectSchema(users, {
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
}).omit({ id: true, createdAt: true })

// Type for InsertUser
export type InsertUser = z.infer<typeof insertUserSchema>