import { 
  User, InsertUser, Supplier, InsertSupplier, 
  Negotiation, InsertNegotiation, Message, InsertMessage,
  Invitation, InsertInvitation, Proposal, InsertProposal,
  ContractTemplate, InsertContractTemplate, Contract, InsertContract,
  SpendUpload, InsertSpendUpload, SpendData, InsertSpendData,
  ApiConnection, InsertApiConnection,
  users, suppliers, negotiations, messages, invitations, proposals,
  contractTemplates, contracts, spendUploads, spendData, apiConnections
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc, not, sql } from "drizzle-orm";
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
  
  // Proposal operations
  getProposal(id: number): Promise<Proposal | undefined>;
  getProposalsByNegotiation(negotiationId: number): Promise<Proposal[]>;
  getProposalsBySupplier(supplierId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<Proposal>): Promise<Proposal | undefined>;
  
  // Contract Template operations
  getContractTemplate(id: number): Promise<ContractTemplate | undefined>;
  getContractTemplatesByCategory(category: string): Promise<ContractTemplate[]>;
  getContractTemplatesForUser(userId: number): Promise<ContractTemplate[]>;
  getDefaultTemplateForCategory(category: string): Promise<ContractTemplate | undefined>;
  createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate>;
  updateContractTemplate(id: number, template: Partial<ContractTemplate>): Promise<ContractTemplate | undefined>;
  
  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByNegotiation(negotiationId: number): Promise<Contract[]>;
  getContractsBySupplier(supplierId: number): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<Contract>): Promise<Contract | undefined>;
  
  // Spend Analysis operations
  // SpendUpload operations
  getSpendUpload(id: number): Promise<SpendUpload | undefined>;
  getSpendUploadsByUser(userId: number): Promise<SpendUpload[]>;
  createSpendUpload(upload: InsertSpendUpload): Promise<SpendUpload>;
  updateSpendUpload(id: number, upload: Partial<SpendUpload>): Promise<SpendUpload | undefined>;

  // SpendData operations
  getSpendData(id: number): Promise<SpendData | undefined>;
  getSpendDataByUpload(uploadId: number): Promise<SpendData[]>;
  getSpendDataByUser(userId: number): Promise<SpendData[]>;
  getSpendDataBySupplier(supplierId: number): Promise<SpendData[]>;
  getSpendDataByCategory(userId: number, category: string): Promise<SpendData[]>;
  getSpendDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<SpendData[]>;
  createSpendData(data: InsertSpendData): Promise<SpendData>;
  createManySpendData(dataItems: InsertSpendData[]): Promise<SpendData[]>;
  
  // API Connections operations
  getApiConnection(id: number): Promise<ApiConnection | undefined>;
  getApiConnectionsByUser(userId: number): Promise<ApiConnection[]>;
  createApiConnection(connection: InsertApiConnection): Promise<ApiConnection>;
  updateApiConnection(id: number, connection: Partial<ApiConnection>): Promise<ApiConnection | undefined>;
  deleteApiConnection(id: number): Promise<boolean>;

  // Summary and Analysis operations
  getSpendBySupplier(userId: number, year?: number): Promise<{ supplierId: number, supplierName: string, total: number }[]>;
  getSpendByCategory(userId: number, year?: number): Promise<{ category: string, total: number }[]>;
  getSpendByYear(userId: number): Promise<{ year: number, total: number }[]>;
  getTopSuppliers(userId: number, limit?: number): Promise<{ supplierId: number, supplierName: string, total: number }[]>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private suppliers: Map<number, Supplier>;
  private negotiations: Map<number, Negotiation>;
  private messages: Map<number, Message>;
  private invitations: Map<number, Invitation>;
  private proposals: Map<number, Proposal>;
  private contractTemplates: Map<number, ContractTemplate>;
  private contracts: Map<number, Contract>;
  private spendUploads: Map<number, SpendUpload>;
  private spendData: Map<number, SpendData>;
  private apiConnections: Map<number, ApiConnection>;
  
  sessionStore: any;
  
  // ID counters
  private userIdCounter: number;
  private supplierIdCounter: number;
  private negotiationIdCounter: number;
  private messageIdCounter: number;
  private invitationIdCounter: number;
  private proposalIdCounter: number;
  private contractTemplateIdCounter: number;
  private contractIdCounter: number;
  private spendUploadIdCounter: number;
  private spendDataIdCounter: number;
  private apiConnectionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.negotiations = new Map();
    this.messages = new Map();
    this.invitations = new Map();
    this.proposals = new Map();
    this.contractTemplates = new Map();
    this.contracts = new Map();
    this.spendUploads = new Map();
    this.spendData = new Map();
    this.apiConnections = new Map();
    
    this.userIdCounter = 1;
    this.supplierIdCounter = 1;
    this.negotiationIdCounter = 1;
    this.messageIdCounter = 1;
    this.invitationIdCounter = 1;
    this.proposalIdCounter = 1;
    this.contractTemplateIdCounter = 1;
    this.contractIdCounter = 1;
    this.spendUploadIdCounter = 1;
    this.spendDataIdCounter = 1;
    this.apiConnectionIdCounter = 1;
    
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
  
  // Proposal operations
  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }
  
  async getProposalsByNegotiation(negotiationId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(
      (proposal) => proposal.negotiationId === negotiationId
    );
  }
  
  async getProposalsBySupplier(supplierId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(
      (proposal) => proposal.supplierId === supplierId
    );
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = this.proposalIdCounter++;
    const now = new Date();
    const proposal: Proposal = {
      ...insertProposal,
      id,
      createdAt: now,
      status: insertProposal.status || "pending",
      description: insertProposal.description || null,
      amount: insertProposal.amount || null,
      metadata: insertProposal.metadata || null
    };
    this.proposals.set(id, proposal);
    return proposal;
  }
  
  async updateProposal(id: number, proposalUpdate: Partial<Proposal>): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    
    const updatedProposal = { ...proposal, ...proposalUpdate };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }
  
  // Contract Template operations
  async getContractTemplate(id: number): Promise<ContractTemplate | undefined> {
    return this.contractTemplates.get(id);
  }
  
  async getContractTemplatesByCategory(category: string): Promise<ContractTemplate[]> {
    return Array.from(this.contractTemplates.values()).filter(
      (template) => template.category === category
    );
  }
  
  async getContractTemplatesForUser(userId: number): Promise<ContractTemplate[]> {
    return Array.from(this.contractTemplates.values()).filter(
      (template) => template.createdBy === userId
    );
  }
  
  async getDefaultTemplateForCategory(category: string): Promise<ContractTemplate | undefined> {
    return Array.from(this.contractTemplates.values()).find(
      (template) => template.category === category && template.isDefault === true
    );
  }
  
  async createContractTemplate(insertTemplate: InsertContractTemplate): Promise<ContractTemplate> {
    const id = this.contractTemplateIdCounter++;
    const now = new Date();
    const template: ContractTemplate = {
      id,
      name: insertTemplate.name,
      category: insertTemplate.category,
      filePath: insertTemplate.filePath,
      fileName: insertTemplate.fileName,
      fileSize: insertTemplate.fileSize,
      createdBy: insertTemplate.createdBy,
      createdAt: now,
      description: insertTemplate.description || null,
      isDefault: insertTemplate.isDefault || false,
      status: insertTemplate.status || "active",
      metadata: insertTemplate.metadata || null
    };
    
    // If this is a default template, update any existing default templates for this category
    if (template.isDefault) {
      const existingTemplates = await this.getContractTemplatesByCategory(template.category);
      for (const existingTemplate of existingTemplates) {
        if (existingTemplate.isDefault && existingTemplate.id !== template.id) {
          await this.updateContractTemplate(existingTemplate.id, { isDefault: false });
        }
      }
    }
    
    this.contractTemplates.set(id, template);
    return template;
  }
  
  async updateContractTemplate(id: number, templateUpdate: Partial<ContractTemplate>): Promise<ContractTemplate | undefined> {
    const template = this.contractTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...templateUpdate };
    
    // If this is being set as a default template, update any existing default templates for this category
    if (templateUpdate.isDefault === true) {
      const existingTemplates = await this.getContractTemplatesByCategory(template.category);
      for (const existingTemplate of existingTemplates) {
        if (existingTemplate.isDefault && existingTemplate.id !== id) {
          existingTemplate.isDefault = false;
          this.contractTemplates.set(existingTemplate.id, existingTemplate);
        }
      }
    }
    
    this.contractTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }
  
  async getContractsByNegotiation(negotiationId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.negotiationId === negotiationId
    );
  }
  
  async getContractsBySupplier(supplierId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.supplierId === supplierId
    );
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractIdCounter++;
    const now = new Date();
    const contract: Contract = {
      id,
      negotiationId: insertContract.negotiationId,
      supplierId: insertContract.supplierId,
      filePath: insertContract.filePath,
      fileName: insertContract.fileName,
      proposalId: insertContract.proposalId || null,
      templateId: insertContract.templateId || null,
      status: insertContract.status || "draft",
      generatedAt: now,
      approvedAt: null,
      signedAt: null,
      terms: insertContract.terms || null,
      metadata: insertContract.metadata || null
    };
    this.contracts.set(id, contract);
    return contract;
  }
  
  async updateContract(id: number, contractUpdate: Partial<Contract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract = { ...contract, ...contractUpdate };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }
  
  // SpendUpload operations
  async getSpendUpload(id: number): Promise<SpendUpload | undefined> {
    return this.spendUploads.get(id);
  }

  async getSpendUploadsByUser(userId: number): Promise<SpendUpload[]> {
    return Array.from(this.spendUploads.values()).filter(
      (upload) => upload.userId === userId
    );
  }

  async createSpendUpload(insertUpload: InsertSpendUpload): Promise<SpendUpload> {
    const id = this.spendUploadIdCounter++;
    const now = new Date();
    const upload: SpendUpload = {
      ...insertUpload,
      id,
      uploadedAt: now,
      processingCompletedAt: null,
      status: insertUpload.status || "processing",
      recordCount: insertUpload.recordCount || 0,
      errorMessage: insertUpload.errorMessage || null,
      metadata: insertUpload.metadata || null,
      source: insertUpload.source || "manual" // Ensure source is not undefined
    };
    this.spendUploads.set(id, upload);
    return upload;
  }

  async updateSpendUpload(id: number, uploadUpdate: Partial<SpendUpload>): Promise<SpendUpload | undefined> {
    const upload = this.spendUploads.get(id);
    if (!upload) return undefined;

    const updatedUpload = { ...upload, ...uploadUpdate };
    this.spendUploads.set(id, updatedUpload);
    return updatedUpload;
  }

  // SpendData operations
  async getSpendData(id: number): Promise<SpendData | undefined> {
    return this.spendData.get(id);
  }

  async getSpendDataByUpload(uploadId: number): Promise<SpendData[]> {
    return Array.from(this.spendData.values()).filter(
      (spendData) => spendData.uploadId === uploadId
    );
  }

  async getSpendDataByUser(userId: number): Promise<SpendData[]> {
    return Array.from(this.spendData.values()).filter(
      (spendData) => spendData.userId === userId
    );
  }

  async getSpendDataBySupplier(supplierId: number): Promise<SpendData[]> {
    return Array.from(this.spendData.values()).filter(
      (spendData) => spendData.supplierId === supplierId
    );
  }

  async getSpendDataByCategory(userId: number, category: string): Promise<SpendData[]> {
    return Array.from(this.spendData.values()).filter(
      (spendData) => spendData.userId === userId && spendData.category === category
    );
  }

  async getSpendDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<SpendData[]> {
    return Array.from(this.spendData.values()).filter(
      (spendData) => {
        return spendData.userId === userId && 
               spendData.transactionDate >= startDate && 
               spendData.transactionDate <= endDate;
      }
    );
  }

  async createSpendData(insertData: InsertSpendData): Promise<SpendData> {
    const id = this.spendDataIdCounter++;
    const now = new Date();
    
    // Create a properly typed SpendData object with defaults for all required fields
    const spendData: SpendData = {
      ...insertData,
      id,
      createdAt: now,
      // Required fields with defaults if not provided
      category: insertData.category,
      userId: insertData.userId,
      supplierName: insertData.supplierName,
      spendAmount: insertData.spendAmount,
      transactionDate: insertData.transactionDate,
      currency: insertData.currency || "USD",
      dataSource: insertData.dataSource || "manual",
      // Optional fields with null defaults
      supplierId: insertData.supplierId || null,
      subcategory: insertData.subcategory || null,
      quantity: insertData.quantity || null,
      unitPrice: insertData.unitPrice || null,
      poNumber: insertData.poNumber || null,
      invoiceNumber: insertData.invoiceNumber || null,
      uploadId: insertData.uploadId || null,
      itemDescription: insertData.itemDescription || null,
      departmentId: insertData.departmentId || null,
      departmentName: insertData.departmentName || null
    };
    
    this.spendData.set(id, spendData);
    return spendData;
  }

  async createManySpendData(dataItems: InsertSpendData[]): Promise<SpendData[]> {
    const createdItems: SpendData[] = [];
    for (const item of dataItems) {
      const createdItem = await this.createSpendData(item);
      createdItems.push(createdItem);
    }
    return createdItems;
  }

  // API Connections operations
  async getApiConnection(id: number): Promise<ApiConnection | undefined> {
    return this.apiConnections.get(id);
  }

  async getApiConnectionsByUser(userId: number): Promise<ApiConnection[]> {
    return Array.from(this.apiConnections.values()).filter(
      (connection) => connection.userId === userId
    );
  }

  async createApiConnection(insertConnection: InsertApiConnection): Promise<ApiConnection> {
    const id = this.apiConnectionIdCounter++;
    const now = new Date();
    const connection: ApiConnection = {
      ...insertConnection,
      id,
      createdAt: now,
      updatedAt: now,
      lastSyncAt: null,
      status: insertConnection.status || "active",
      metadata: insertConnection.metadata || null,
      credentials: insertConnection.credentials || {}
    };
    this.apiConnections.set(id, connection);
    return connection;
  }

  async updateApiConnection(id: number, connectionUpdate: Partial<ApiConnection>): Promise<ApiConnection | undefined> {
    const connection = this.apiConnections.get(id);
    if (!connection) return undefined;

    const updatedConnection = { 
      ...connection, 
      ...connectionUpdate,
      updatedAt: new Date() 
    };
    this.apiConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteApiConnection(id: number): Promise<boolean> {
    return this.apiConnections.delete(id);
  }

  // Summary and Analysis operations
  async getSpendBySupplier(userId: number, year?: number): Promise<{ supplierId: number, supplierName: string, total: number }[]> {
    const userSpendData = await this.getSpendDataByUser(userId);
    
    // Filter by year if provided
    const filteredData = year 
      ? userSpendData.filter(data => new Date(data.transactionDate).getFullYear() === year)
      : userSpendData;
    
    // Group by supplier and sum totals
    const supplierMap = new Map<number | string, { supplierId: number | null, supplierName: string, total: number }>();
    
    for (const data of filteredData) {
      const key = data.supplierId || data.supplierName;
      const existing = supplierMap.get(key) || { 
        supplierId: data.supplierId || null, 
        supplierName: data.supplierName, 
        total: 0 
      };
      
      existing.total += Number(data.spendAmount);
      supplierMap.set(key, existing);
    }
    
    // Convert to array and sort by total spending (descending)
    return Array.from(supplierMap.values())
      .filter(item => item.supplierId !== null)
      .map(item => ({ 
        supplierId: item.supplierId as number, 
        supplierName: item.supplierName, 
        total: item.total 
      }))
      .sort((a, b) => b.total - a.total);
  }

  async getSpendByCategory(userId: number, year?: number): Promise<{ category: string, total: number }[]> {
    const userSpendData = await this.getSpendDataByUser(userId);
    
    // Filter by year if provided
    const filteredData = year 
      ? userSpendData.filter(data => new Date(data.transactionDate).getFullYear() === year)
      : userSpendData;
    
    // Group by category and sum totals
    const categoryMap = new Map<string, number>();
    
    for (const data of filteredData) {
      const existing = categoryMap.get(data.category) || 0;
      categoryMap.set(data.category, existing + Number(data.spendAmount));
    }
    
    // Convert to array and sort by total spending (descending)
    return Array.from(categoryMap.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }

  async getSpendByYear(userId: number): Promise<{ year: number, total: number }[]> {
    const userSpendData = await this.getSpendDataByUser(userId);
    
    // Group by year and sum totals
    const yearMap = new Map<number, number>();
    
    for (const data of userSpendData) {
      const year = new Date(data.transactionDate).getFullYear();
      const existing = yearMap.get(year) || 0;
      yearMap.set(year, existing + Number(data.spendAmount));
    }
    
    // Convert to array and sort by year (ascending)
    return Array.from(yearMap.entries())
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => a.year - b.year);
  }

  async getTopSuppliers(userId: number, limit: number = 10): Promise<{ supplierId: number, supplierName: string, total: number }[]> {
    const supplierSpendData = await this.getSpendBySupplier(userId);
    return supplierSpendData.slice(0, limit);
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
  
  // SpendUpload operations
  async getSpendUpload(id: number): Promise<SpendUpload | undefined> {
    const [upload] = await db.select().from(spendUploads).where(eq(spendUploads.id, id));
    return upload;
  }

  async getSpendUploadsByUser(userId: number): Promise<SpendUpload[]> {
    return db
      .select()
      .from(spendUploads)
      .where(eq(spendUploads.userId, userId))
      .orderBy(desc(spendUploads.uploadedAt));
  }

  async createSpendUpload(insertUpload: InsertSpendUpload): Promise<SpendUpload> {
    const [upload] = await db.insert(spendUploads).values(insertUpload).returning();
    return upload;
  }

  async updateSpendUpload(id: number, uploadUpdate: Partial<SpendUpload>): Promise<SpendUpload | undefined> {
    const [updatedUpload] = await db
      .update(spendUploads)
      .set(uploadUpdate)
      .where(eq(spendUploads.id, id))
      .returning();
    return updatedUpload;
  }

  // SpendData operations
  async getSpendData(id: number): Promise<SpendData | undefined> {
    const [data] = await db.select().from(spendData).where(eq(spendData.id, id));
    return data;
  }

  async getSpendDataByUpload(uploadId: number): Promise<SpendData[]> {
    return db
      .select()
      .from(spendData)
      .where(eq(spendData.uploadId, uploadId));
  }

  async getSpendDataByUser(userId: number): Promise<SpendData[]> {
    return db
      .select()
      .from(spendData)
      .where(eq(spendData.userId, userId));
  }

  async getSpendDataBySupplier(supplierId: number): Promise<SpendData[]> {
    return db
      .select()
      .from(spendData)
      .where(eq(spendData.supplierId, supplierId));
  }

  async getSpendDataByCategory(userId: number, category: string): Promise<SpendData[]> {
    return db
      .select()
      .from(spendData)
      .where(and(
        eq(spendData.userId, userId),
        eq(spendData.category, category)
      ));
  }

  async getSpendDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<SpendData[]> {
    return db
      .select()
      .from(spendData)
      .where(and(
        eq(spendData.userId, userId),
        // Use SQL functions as Drizzle columns might not have gte/lte methods
        sql`${spendData.transactionDate} >= ${startDate}`,
        sql`${spendData.transactionDate} <= ${endDate}`
      ));
  }

  async createSpendData(insertData: InsertSpendData): Promise<SpendData> {
    const [data] = await db.insert(spendData).values(insertData).returning();
    return data;
  }

  async createManySpendData(dataItems: InsertSpendData[]): Promise<SpendData[]> {
    return db.insert(spendData).values(dataItems).returning();
  }

  // API Connections operations
  async getApiConnection(id: number): Promise<ApiConnection | undefined> {
    const [connection] = await db.select().from(apiConnections).where(eq(apiConnections.id, id));
    return connection;
  }

  async getApiConnectionsByUser(userId: number): Promise<ApiConnection[]> {
    return db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.userId, userId));
  }

  async createApiConnection(insertConnection: InsertApiConnection): Promise<ApiConnection> {
    const [connection] = await db.insert(apiConnections).values(insertConnection).returning();
    return connection;
  }

  async updateApiConnection(id: number, connectionUpdate: Partial<ApiConnection>): Promise<ApiConnection | undefined> {
    // Always update the updatedAt field to current time
    const updatedConnectionData = {
      ...connectionUpdate,
      updatedAt: new Date()
    };
    
    const [updatedConnection] = await db
      .update(apiConnections)
      .set(updatedConnectionData)
      .where(eq(apiConnections.id, id))
      .returning();
    return updatedConnection;
  }

  async deleteApiConnection(id: number): Promise<boolean> {
    // Note: Drizzle doesn't return a boolean, so we have to check if any rows were affected
    const result = await db
      .delete(apiConnections)
      .where(eq(apiConnections.id, id));
    return !!result;
  }

  // Summary and Analysis operations
  async getSpendBySupplier(userId: number, year?: number): Promise<{ supplierId: number, supplierName: string, total: number }[]> {
    let baseQuery = db
      .select({
        supplierId: spendData.supplierId,
        supplierName: spendData.supplierName,
        total: sql<number>`sum(${spendData.spendAmount})`,
      })
      .from(spendData)
      .where(eq(spendData.userId, userId));
    
    // Create conditions array
    const conditions = [eq(spendData.userId, userId)];
    
    // Add year condition if specified
    if (year) {
      conditions.push(sql`EXTRACT(YEAR FROM ${spendData.transactionDate}) = ${year}`);
    }
    
    // Add non-null supplier condition
    conditions.push(not(sql`${spendData.supplierId} IS NULL`));
    
    // Execute query with all conditions
    const results = await db
      .select({
        supplierId: spendData.supplierId,
        supplierName: spendData.supplierName,
        total: sql<number>`sum(${spendData.spendAmount})`,
      })
      .from(spendData)
      .where(and(...conditions))
      .groupBy(spendData.supplierId, spendData.supplierName)
      .orderBy(sql`sum(${spendData.spendAmount})` as any, 'desc');
    
    // Ensure we only return results with non-null supplierId to match the return type
    return results
      .filter(item => item.supplierId !== null)
      .map(item => ({
        supplierId: item.supplierId as number,
        supplierName: item.supplierName,
        total: Number(item.total)
      }));
  }

  async getSpendByCategory(userId: number, year?: number): Promise<{ category: string, total: number }[]> {
    // Create conditions array
    const conditions = [eq(spendData.userId, userId)];
    
    // Add year condition if specified
    if (year) {
      conditions.push(sql`EXTRACT(YEAR FROM ${spendData.transactionDate}) = ${year}`);
    }
    
    // Execute query with all conditions
    const results = await db
      .select({
        category: spendData.category,
        total: sql<number>`sum(${spendData.spendAmount})`,
      })
      .from(spendData)
      .where(and(...conditions))
      .groupBy(spendData.category)
      .orderBy(sql`sum(${spendData.spendAmount})` as any, 'desc');
    
    // Convert any string totals to numbers to ensure type consistency
    return results.map(item => ({
      category: item.category,
      total: Number(item.total)
    }));
  }

  async getSpendByYear(userId: number): Promise<{ year: number, total: number }[]> {
    const results = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${spendData.transactionDate})`,
        total: sql<number>`sum(${spendData.spendAmount})`,
      })
      .from(spendData)
      .where(eq(spendData.userId, userId))
      .groupBy(sql`EXTRACT(YEAR FROM ${spendData.transactionDate})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${spendData.transactionDate})` as any);
      
    // Convert any string totals to numbers and ensure year is a number
    return results.map(item => ({
      year: Number(item.year),
      total: Number(item.total)
    }));
  }

  async getTopSuppliers(userId: number, limit: number = 10): Promise<{ supplierId: number, supplierName: string, total: number }[]> {
    // Execute query
    const results = await db
      .select({
        supplierId: spendData.supplierId,
        supplierName: spendData.supplierName,
        total: sql<number>`sum(${spendData.spendAmount})`,
      })
      .from(spendData)
      .where(and(
        eq(spendData.userId, userId),
        not(sql`${spendData.supplierId} IS NULL`)
      ))
      .groupBy(spendData.supplierId, spendData.supplierName)
      .orderBy(sql`sum(${spendData.spendAmount})` as any, 'desc')
      .limit(limit);

    // Filter out any results with null supplierId and convert to the expected format
    return results
      .filter(item => item.supplierId !== null)
      .map(item => ({
        supplierId: item.supplierId as number,
        supplierName: item.supplierName,
        total: Number(item.total)
      }));
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
  
  // Proposal operations
  async getProposal(id: number): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal;
  }
  
  async getProposalsByNegotiation(negotiationId: number): Promise<Proposal[]> {
    return db
      .select()
      .from(proposals)
      .where(eq(proposals.negotiationId, negotiationId))
      .orderBy(desc(proposals.createdAt));
  }
  
  async getProposalsBySupplier(supplierId: number): Promise<Proposal[]> {
    return db
      .select()
      .from(proposals)
      .where(eq(proposals.supplierId, supplierId))
      .orderBy(desc(proposals.createdAt));
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const [proposal] = await db.insert(proposals).values(insertProposal).returning();
    return proposal;
  }
  
  async updateProposal(id: number, proposalUpdate: Partial<Proposal>): Promise<Proposal | undefined> {
    const [updatedProposal] = await db
      .update(proposals)
      .set(proposalUpdate)
      .where(eq(proposals.id, id))
      .returning();
    return updatedProposal;
  }
  
  // Contract Template operations
  async getContractTemplate(id: number): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template;
  }
  
  async getContractTemplatesByCategory(category: string): Promise<ContractTemplate[]> {
    return db
      .select()
      .from(contractTemplates)
      .where(eq(contractTemplates.category, category));
  }
  
  async getContractTemplatesForUser(userId: number): Promise<ContractTemplate[]> {
    return db
      .select()
      .from(contractTemplates)
      .where(eq(contractTemplates.createdBy, userId));
  }
  
  async getDefaultTemplateForCategory(category: string): Promise<ContractTemplate | undefined> {
    const [template] = await db
      .select()
      .from(contractTemplates)
      .where(and(
        eq(contractTemplates.category, category),
        eq(contractTemplates.isDefault, true)
      ));
    return template;
  }
  
  async createContractTemplate(insertTemplate: InsertContractTemplate): Promise<ContractTemplate> {
    // If this is a default template, update any existing default templates for this category
    if (insertTemplate.isDefault) {
      await db
        .update(contractTemplates)
        .set({ isDefault: false })
        .where(and(
          eq(contractTemplates.category, insertTemplate.category),
          eq(contractTemplates.isDefault, true)
        ));
    }
    
    const [template] = await db.insert(contractTemplates).values(insertTemplate).returning();
    return template;
  }
  
  async updateContractTemplate(id: number, templateUpdate: Partial<ContractTemplate>): Promise<ContractTemplate | undefined> {
    // If this is being set as a default template, update any existing default templates for this category
    if (templateUpdate.isDefault === true) {
      // Get the category of the template being updated
      const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
      
      if (template) {
        // First get all templates in the same category that are default except the current one
        const otherDefaultTemplates = await db
          .select()
          .from(contractTemplates)
          .where(and(
            eq(contractTemplates.category, template.category),
            eq(contractTemplates.isDefault, true)
          ));
          
        // Then update each one individually (except the current one)
        for (const tmpl of otherDefaultTemplates) {
          if (tmpl.id !== id) {
            await db
              .update(contractTemplates)
              .set({ isDefault: false })
              .where(eq(contractTemplates.id, tmpl.id));
          }
        }
      }
    }
    
    const [updatedTemplate] = await db
      .update(contractTemplates)
      .set(templateUpdate)
      .where(eq(contractTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }
  
  async getContractsByNegotiation(negotiationId: number): Promise<Contract[]> {
    return db
      .select()
      .from(contracts)
      .where(eq(contracts.negotiationId, negotiationId));
  }
  
  async getContractsBySupplier(supplierId: number): Promise<Contract[]> {
    return db
      .select()
      .from(contracts)
      .where(eq(contracts.supplierId, supplierId));
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(contracts).values(insertContract).returning();
    return contract;
  }
  
  async updateContract(id: number, contractUpdate: Partial<Contract>): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set(contractUpdate)
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
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
