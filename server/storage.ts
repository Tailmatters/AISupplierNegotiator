import { 
  User, InsertUser, Supplier, InsertSupplier, 
  Negotiation, InsertNegotiation, Message, InsertMessage,
  Invitation, InsertInvitation,
  users, suppliers, negotiations, messages, invitations
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByEmail(email: string): Promise<Supplier | undefined>;
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier | undefined>;
  
  // Negotiation operations
  getNegotiation(id: number): Promise<Negotiation | undefined>;
  getNegotiations(): Promise<Negotiation[]>;
  getNegotiationsByUser(userId: number): Promise<Negotiation[]>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiation(id: number, negotiation: Partial<Negotiation>): Promise<Negotiation | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByNegotiation(negotiationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Invitation operations
  getInvitation(id: number): Promise<Invitation | undefined>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  getInvitationsByNegotiation(negotiationId: number): Promise<Invitation[]>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  updateInvitation(id: number, invitation: Partial<Invitation>): Promise<Invitation | undefined>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private suppliers: Map<number, Supplier>;
  private negotiations: Map<number, Negotiation>;
  private messages: Map<number, Message>;
  private invitations: Map<number, Invitation>;
  
  sessionStore: any;
  
  // ID counters
  private userIdCounter: number;
  private supplierIdCounter: number;
  private negotiationIdCounter: number;
  private messageIdCounter: number;
  private invitationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.negotiations = new Map();
    this.messages = new Map();
    this.invitations = new Map();
    
    this.userIdCounter = 1;
    this.supplierIdCounter = 1;
    this.negotiationIdCounter = 1;
    this.messageIdCounter = 1;
    this.invitationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create sample data for demonstration
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }
  
  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async getSupplierByEmail(email: string): Promise<Supplier | undefined> {
    return Array.from(this.suppliers.values()).find(
      (supplier) => supplier.email === email,
    );
  }
  
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }
  
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierIdCounter++;
    const now = new Date();
    const supplier: Supplier = { 
      ...insertSupplier, 
      id, 
      createdAt: now,
      lastActivity: now,
      status: insertSupplier.status || "active",
      contactPerson: insertSupplier.contactPerson || null
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }
  
  async updateSupplier(id: number, supplierUpdate: Partial<Supplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...supplierUpdate };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }
  
  // Negotiation operations
  async getNegotiation(id: number): Promise<Negotiation | undefined> {
    return this.negotiations.get(id);
  }
  
  async getNegotiations(): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values());
  }
  
  async getNegotiationsByUser(userId: number): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values()).filter(
      (negotiation) => negotiation.createdBy === userId,
    );
  }
  
  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const id = this.negotiationIdCounter++;
    const now = new Date();
    const negotiation: Negotiation = { 
      ...insertNegotiation, 
      id,
      startedAt: now,
      messageCount: 0,
      completedAt: null,
      outcome: null,
      savingsPercentage: null,
      status: insertNegotiation.status || "pending",
      pastDataFilePath: insertNegotiation.pastDataFilePath || null
    };
    this.negotiations.set(id, negotiation);
    return negotiation;
  }
  
  async updateNegotiation(id: number, negotiationUpdate: Partial<Negotiation>): Promise<Negotiation | undefined> {
    const negotiation = this.negotiations.get(id);
    if (!negotiation) return undefined;
    
    const updatedNegotiation = { ...negotiation, ...negotiationUpdate };
    this.negotiations.set(id, updatedNegotiation);
    return updatedNegotiation;
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByNegotiation(negotiationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.negotiationId === negotiationId)
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
        return aTime - bTime;
      });
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: now,
      metadata: insertMessage.metadata || null
    };
    this.messages.set(id, message);
    
    // Increment message count for the associated negotiation
    const negotiation = this.negotiations.get(message.negotiationId);
    if (negotiation) {
      negotiation.messageCount = (negotiation.messageCount || 0) + 1;
      this.negotiations.set(negotiation.id, negotiation);
    }
    
    return message;
  }
  
  // Invitation operations
  async getInvitation(id: number): Promise<Invitation | undefined> {
    return this.invitations.get(id);
  }
  
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    return Array.from(this.invitations.values()).find(
      (invitation) => invitation.token === token,
    );
  }
  
  async getInvitationsByNegotiation(negotiationId: number): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).filter(
      (invitation) => invitation.negotiationId === negotiationId,
    );
  }
  
  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const id = this.invitationIdCounter++;
    const now = new Date();
    const invitation: Invitation = { 
      ...insertInvitation, 
      id,
      createdAt: now,
      respondedAt: null,
      status: insertInvitation.status || "pending"
    };
    this.invitations.set(id, invitation);
    return invitation;
  }
  
  async updateInvitation(id: number, invitationUpdate: Partial<Invitation>): Promise<Invitation | undefined> {
    const invitation = this.invitations.get(id);
    if (!invitation) return undefined;
    
    const updatedInvitation = { ...invitation, ...invitationUpdate };
    this.invitations.set(id, updatedInvitation);
    return updatedInvitation;
  }
  
  // Initialize sample data
  private initializeSampleData() {
    // This is demo data for the UI to show something
    // In a real app this would be empty initially
    
    // Sample categories
    const categories = [
      "IT Hardware",
      "Office Supplies",
      "Office Furniture",
      "Logistics",
      "Cloud Services",
      "Professional Services"
    ];
    
    // Sample suppliers
    const sampleSuppliers: InsertSupplier[] = [
      {
        name: "Dell Technologies",
        email: "contact@dell.com",
        contactPerson: "John Miller",
        category: "IT Hardware",
        status: "active"
      },
      {
        name: "Herman Miller",
        email: "procurement@hermanmiller.com",
        contactPerson: "Sarah Johnson",
        category: "Office Furniture",
        status: "active"
      },
      {
        name: "DHL Express",
        email: "business@dhl.com",
        contactPerson: "Michael Torres",
        category: "Logistics",
        status: "active"
      },
      {
        name: "AWS",
        email: "enterprise@aws.com",
        contactPerson: "Jason Wei",
        category: "Cloud Services",
        status: "active"
      },
      {
        name: "Staples",
        email: "b2b@staples.com",
        contactPerson: "Melissa Chen",
        category: "Office Supplies",
        status: "inactive"
      }
    ];
    
    // Create suppliers
    sampleSuppliers.forEach(supplier => {
      this.createSupplier(supplier);
    });
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }
  
  async getSupplierByEmail(email: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.email, email));
    return supplier;
  }
  
  async getSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers);
  }
  
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(insertSupplier).returning();
    return supplier;
  }
  
  async updateSupplier(id: number, supplierUpdate: Partial<Supplier>): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set(supplierUpdate)
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }
  
  // Negotiation operations
  async getNegotiation(id: number): Promise<Negotiation | undefined> {
    const [negotiation] = await db.select().from(negotiations).where(eq(negotiations.id, id));
    return negotiation;
  }
  
  async getNegotiations(): Promise<Negotiation[]> {
    return db.select().from(negotiations).orderBy(desc(negotiations.startedAt));
  }
  
  async getNegotiationsByUser(userId: number): Promise<Negotiation[]> {
    return db
      .select()
      .from(negotiations)
      .where(eq(negotiations.createdBy, userId))
      .orderBy(desc(negotiations.startedAt));
  }
  
  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const [negotiation] = await db.insert(negotiations).values(insertNegotiation).returning();
    return negotiation;
  }
  
  async updateNegotiation(id: number, negotiationUpdate: Partial<Negotiation>): Promise<Negotiation | undefined> {
    const [updatedNegotiation] = await db
      .update(negotiations)
      .set(negotiationUpdate)
      .where(eq(negotiations.id, id))
      .returning();
    return updatedNegotiation;
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async getMessagesByNegotiation(negotiationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.negotiationId, negotiationId))
      .orderBy(messages.timestamp);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    
    // Increment message count in the negotiation
    // Get the current negotiation
    const [negotiation] = await db
      .select()
      .from(negotiations)
      .where(eq(negotiations.id, insertMessage.negotiationId));
      
    if (negotiation) {
      // Increment the message count
      const messageCount = (negotiation.messageCount || 0) + 1;
      await db
        .update(negotiations)
        .set({ messageCount })
        .where(eq(negotiations.id, insertMessage.negotiationId));
    }
      
    return message;
  }
  
  // Invitation operations
  async getInvitation(id: number): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.id, id));
    return invitation;
  }
  
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token));
    return invitation;
  }
  
  async getInvitationsByNegotiation(negotiationId: number): Promise<Invitation[]> {
    return db
      .select()
      .from(invitations)
      .where(eq(invitations.negotiationId, negotiationId));
  }
  
  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const [invitation] = await db.insert(invitations).values(insertInvitation).returning();
    return invitation;
  }
  
  async updateInvitation(id: number, invitationUpdate: Partial<Invitation>): Promise<Invitation | undefined> {
    const [updatedInvitation] = await db
      .update(invitations)
      .set(invitationUpdate)
      .where(eq(invitations.id, id))
      .returning();
    return updatedInvitation;
  }
}

// Create storage instance
export const storage = new DatabaseStorage();

// Seed database with sample suppliers if needed
async function seedSampleData() {
  // Check if we already have suppliers
  const existingSuppliers = await storage.getSuppliers();
  
  if (existingSuppliers.length === 0) {
    console.log("Seeding database with sample suppliers...");
    
    // Sample suppliers
    const sampleSuppliers: InsertSupplier[] = [
      {
        name: "Dell Technologies",
        email: "contact@dell.com",
        contactPerson: "John Miller",
        category: "IT Hardware",
        status: "active"
      },
      {
        name: "Herman Miller",
        email: "procurement@hermanmiller.com",
        contactPerson: "Sarah Johnson",
        category: "Office Furniture",
        status: "active"
      },
      {
        name: "DHL Express",
        email: "business@dhl.com",
        contactPerson: "Michael Torres",
        category: "Logistics",
        status: "active"
      },
      {
        name: "AWS",
        email: "enterprise@aws.com",
        contactPerson: "Jason Wei",
        category: "Cloud Services",
        status: "active"
      },
      {
        name: "Staples",
        email: "b2b@staples.com",
        contactPerson: "Melissa Chen",
        category: "Office Supplies",
        status: "inactive"
      }
    ];
    
    // Create suppliers
    for (const supplier of sampleSuppliers) {
      await storage.createSupplier(supplier);
    }
    
    console.log("Database seeded successfully!");
  }
}

// Call seed function
seedSampleData().catch(error => {
  console.error("Error seeding database:", error);
});
