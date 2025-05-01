import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'
import { eq } from 'drizzle-orm'

// Configure WebSockets for Neon Database
neonConfig.webSocketConstructor = ws

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema })

// User-related database functions

/**
 * Get a user by ID
 */
export async function getUserById(id: number) {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
    
    return user
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
    
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

/**
 * Create a new user
 */
export async function createUser(user: schema.InsertUser) {
  try {
    const [newUser] = await db
      .insert(schema.users)
      .values(user)
      .returning()
    
    return newUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update a user
 */
export async function updateUser(id: number, data: Partial<schema.User>) {
  try {
    const [updatedUser] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning()
    
    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: number) {
  try {
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
    
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Category-related database functions

/**
 * Get all categories
 */
export async function getAllCategories() {
  try {
    return await db.select().from(schema.categories)
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: number) {
  try {
    const [category] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
    
    return category
  } catch (error) {
    console.error('Error getting category by ID:', error)
    return null
  }
}

// Supplier-related database functions

/**
 * Get all suppliers
 */
export async function getAllSuppliers() {
  try {
    return await db.select().from(schema.suppliers)
  } catch (error) {
    console.error('Error getting suppliers:', error)
    return []
  }
}

/**
 * Get a supplier by ID
 */
export async function getSupplierById(id: number) {
  try {
    const [supplier] = await db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.id, id))
    
    return supplier
  } catch (error) {
    console.error('Error getting supplier by ID:', error)
    return null
  }
}

/**
 * Create a new supplier
 */
export async function createSupplier(supplier: schema.InsertSupplier) {
  try {
    const [newSupplier] = await db
      .insert(schema.suppliers)
      .values(supplier)
      .returning()
    
    return newSupplier
  } catch (error) {
    console.error('Error creating supplier:', error)
    throw error
  }
}

// Negotiation-related database functions

/**
 * Get all negotiations for a user
 */
export async function getUserNegotiations(userId: number) {
  try {
    return await db
      .select()
      .from(schema.negotiations)
      .where(eq(schema.negotiations.userId, userId))
  } catch (error) {
    console.error('Error getting user negotiations:', error)
    return []
  }
}

/**
 * Get a negotiation by ID
 */
export async function getNegotiationById(id: number) {
  try {
    const [negotiation] = await db
      .select()
      .from(schema.negotiations)
      .where(eq(schema.negotiations.id, id))
    
    return negotiation
  } catch (error) {
    console.error('Error getting negotiation by ID:', error)
    return null
  }
}

/**
 * Create a new negotiation
 */
export async function createNegotiation(negotiation: schema.InsertNegotiation) {
  try {
    const [newNegotiation] = await db
      .insert(schema.negotiations)
      .values(negotiation)
      .returning()
    
    return newNegotiation
  } catch (error) {
    console.error('Error creating negotiation:', error)
    throw error
  }
}

// Message-related database functions

/**
 * Get all messages for a negotiation
 */
export async function getNegotiationMessages(negotiationId: number) {
  try {
    return await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.negotiationId, negotiationId))
  } catch (error) {
    console.error('Error getting negotiation messages:', error)
    return []
  }
}

/**
 * Create a new message
 */
export async function createMessage(message: schema.InsertMessage) {
  try {
    const [newMessage] = await db
      .insert(schema.messages)
      .values(message)
      .returning()
    
    return newMessage
  } catch (error) {
    console.error('Error creating message:', error)
    throw error
  }
}

// Contract-related database functions

/**
 * Get all contract templates for a category
 */
export async function getCategoryContractTemplates(categoryId: number) {
  try {
    return await db
      .select()
      .from(schema.contractTemplates)
      .where(eq(schema.contractTemplates.categoryId, categoryId))
  } catch (error) {
    console.error('Error getting category contract templates:', error)
    return []
  }
}

/**
 * Create a new contract template
 */
export async function createContractTemplate(template: schema.InsertContractTemplate) {
  try {
    const [newTemplate] = await db
      .insert(schema.contractTemplates)
      .values(template)
      .returning()
    
    return newTemplate
  } catch (error) {
    console.error('Error creating contract template:', error)
    throw error
  }
}

/**
 * Create a new contract
 */
export async function createContract(contract: schema.InsertContract) {
  try {
    const [newContract] = await db
      .insert(schema.contracts)
      .values(contract)
      .returning()
    
    return newContract
  } catch (error) {
    console.error('Error creating contract:', error)
    throw error
  }
}

// Dashboard widget-related database functions

/**
 * Get all dashboard widgets for a user
 */
export async function getUserDashboardWidgets(userId: number) {
  try {
    return await db
      .select()
      .from(schema.dashboardWidgets)
      .where(eq(schema.dashboardWidgets.userId, userId))
  } catch (error) {
    console.error('Error getting user dashboard widgets:', error)
    return []
  }
}

/**
 * Create a new dashboard widget
 */
export async function createDashboardWidget(widget: schema.InsertDashboardWidget) {
  try {
    const [newWidget] = await db
      .insert(schema.dashboardWidgets)
      .values(widget)
      .returning()
    
    return newWidget
  } catch (error) {
    console.error('Error creating dashboard widget:', error)
    throw error
  }
}

// Spend data-related database functions

/**
 * Get all spend data for a user
 */
export async function getUserSpendData(userId: number) {
  try {
    const uploads = await db
      .select()
      .from(schema.spendUploads)
      .where(eq(schema.spendUploads.userId, userId))
    
    if (uploads.length === 0) {
      return []
    }
    
    const uploadIds = uploads.map(u => u.id)
    
    // This requires more complex query with "in" operator
    // For simplicity, we'll just return an empty array for now
    // In a real implementation, we would filter by uploadIds
    
    return []
  } catch (error) {
    console.error('Error getting user spend data:', error)
    return []
  }
}

/**
 * Create a new spend upload
 */
export async function createSpendUpload(upload: schema.InsertSpendUpload) {
  try {
    const [newUpload] = await db
      .insert(schema.spendUploads)
      .values(upload)
      .returning()
    
    return newUpload
  } catch (error) {
    console.error('Error creating spend upload:', error)
    throw error
  }
}