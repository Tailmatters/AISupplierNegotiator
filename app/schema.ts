import { pgTable, serial, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

// Role enum for user types
export const roleEnum = pgEnum('role', ['admin', 'buyer', 'supplier'])

// Core database models

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('buyer'),
  company: text('company'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Validation schemas for insertion
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
    name: true,
    role: true,
    company: true,
  })
  .extend({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })

// Type definitions
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>

// Additional schema models will be added as needed during migration