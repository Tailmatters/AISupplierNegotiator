import { 
  User, InsertUser, Supplier, InsertSupplier, 
  Negotiation, InsertNegotiation, Message, InsertMessage,
  Invitation, InsertInvitation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private suppliers: Map<number, Supplier>;
  private negotiations: Map<number, Negotiation>;
  private messages: Map<number, Message>;
  private invitations: Map<number, Invitation>;
  
  sessionStore: session.SessionStore;
  
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
      createdAt: now 
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
      lastActivity: now
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
      savingsPercentage: null
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
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: now
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
      respondedAt: null
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

// Create storage instance
export const storage = new MemStorage();
