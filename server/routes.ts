import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzePastNegotiations, generateInitialMessage, generateNegotiationResponse, analyzeNegotiationResult } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { insertNegotiationSchema, insertSupplierSchema, insertMessageSchema, insertInvitationSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common document types
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, PDF, Word, and text files are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Dashboard stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const negotiations = await storage.getNegotiationsByUser(req.user!.id);
      const suppliers = await storage.getSuppliers();
      
      const activeNegotiations = negotiations.filter(n => n.status === 'active').length;
      const completedNegotiations = negotiations.filter(n => n.status === 'completed').length;
      const supplierCount = suppliers.length;
      
      // Calculate total savings (in a real app this would be calculated from actual negotiation data)
      const savedNegotiations = negotiations.filter(n => n.savingsPercentage);
      const totalSavings = savedNegotiations.reduce((acc, n) => acc + (n.savingsPercentage || 0), 0);
      const averageSavings = savedNegotiations.length > 0 ? totalSavings / savedNegotiations.length : 0;
      
      res.json({
        activeNegotiations,
        completedNegotiations,
        suppliers: supplierCount,
        costSaved: Math.round(averageSavings * 1000), // Mock value for demo purposes
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  
  // Supplier routes
  app.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Error fetching suppliers" });
    }
  });
  
  app.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Error creating supplier" });
    }
  });
  
  app.get("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Error fetching supplier" });
    }
  });
  
  // Negotiation routes
  app.get("/api/negotiations", isAuthenticated, async (req, res) => {
    try {
      const negotiations = await storage.getNegotiationsByUser(req.user!.id);
      
      // For each negotiation, get the supplier
      const negotiationsWithSuppliers = await Promise.all(
        negotiations.map(async (negotiation) => {
          const supplier = await storage.getSupplier(negotiation.supplierId);
          return {
            ...negotiation,
            supplier: supplier || { name: "Unknown Supplier" }
          };
        })
      );
      
      res.json(negotiationsWithSuppliers);
    } catch (error) {
      console.error("Error fetching negotiations:", error);
      res.status(500).json({ message: "Error fetching negotiations" });
    }
  });
  
  app.post("/api/negotiations", isAuthenticated, upload.single('pastData'), async (req, res) => {
    try {
      // If file was uploaded, read its contents
      let pastDataContent = "";
      let pastDataFilePath = "";
      
      if (req.file) {
        pastDataFilePath = req.file.path;
        
        // Read file content if it's a text file
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.txt' || ext === '.csv') {
          pastDataContent = fs.readFileSync(req.file.path, 'utf8');
        } else {
          pastDataContent = "File uploaded but content not readable in plain text format.";
        }
      }
      
      // Parse JSON from form data
      const negotiationData = {
        title: req.body.title,
        category: req.body.category,
        objectives: req.body.objectives,
        supplierId: parseInt(req.body.supplierId),
        status: 'pending',
        pastDataFilePath: pastDataFilePath,
        createdBy: req.user!.id
      };
      
      const validatedData = insertNegotiationSchema.parse(negotiationData);
      const negotiation = await storage.createNegotiation(validatedData);
      
      // Analyze past data if available
      let analysis = null;
      if (pastDataContent) {
        try {
          analysis = await analyzePastNegotiations(pastDataContent, negotiation.category);
        } catch (err) {
          console.error("Error analyzing past data:", err);
          // Continue even if analysis fails
          analysis = {
            priceInsights: "Unable to analyze price data.",
            tactics: "No specific tactics identified.",
            objections: [],
            recommendedApproach: "Proceed with standard negotiation approach."
          };
        }
      }
      
      // Generate initial message if supplier exists
      if (negotiation.supplierId) {
        const supplier = await storage.getSupplier(negotiation.supplierId);
        if (supplier) {
          try {
            const initialMessage = await generateInitialMessage(
              supplier.name,
              negotiation.category,
              negotiation.objectives,
              analysis || {
                priceInsights: "No historical data available.",
                tactics: "Standard negotiation tactics recommended.",
                recommendedApproach: "Focus on stated objectives."
              }
            );
            
            // Create system message
            await storage.createMessage({
              negotiationId: negotiation.id,
              senderId: "system",
              senderType: "system",
              content: "Negotiation started",
              metadata: { event: "negotiation_started" }
            });
            
            // Create AI message
            await storage.createMessage({
              negotiationId: negotiation.id,
              senderId: "ai",
              senderType: "ai",
              content: initialMessage,
              metadata: { analysis }
            });
            
            // Update negotiation status to active
            await storage.updateNegotiation(negotiation.id, { status: "active" });
          } catch (err) {
            console.error("Error generating initial message:", err);
            // Continue even if message generation fails
          }
        }
      }
      
      res.status(201).json(negotiation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating negotiation:", error);
      res.status(500).json({ message: "Error creating negotiation" });
    }
  });
  
  app.get("/api/negotiations/:id", isAuthenticated, async (req, res) => {
    try {
      const negotiation = await storage.getNegotiation(parseInt(req.params.id));
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized to view this negotiation
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this negotiation" });
      }
      
      // Get supplier details
      const supplier = await storage.getSupplier(negotiation.supplierId);
      
      res.json({
        ...negotiation,
        supplier
      });
    } catch (error) {
      console.error("Error fetching negotiation:", error);
      res.status(500).json({ message: "Error fetching negotiation" });
    }
  });
  
  // Messages routes
  app.get("/api/negotiations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const negotiation = await storage.getNegotiation(parseInt(req.params.id));
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized to view messages
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view messages" });
      }
      
      const messages = await storage.getMessagesByNegotiation(negotiation.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  
  app.post("/api/negotiations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized to send messages
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to send messages to this negotiation" });
      }
      
      // Create the user message
      const messageData = {
        negotiationId,
        senderId: req.user!.id.toString(),
        senderType: "user",
        content: req.body.content,
        metadata: req.body.metadata || null
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      
      // Generate AI response
      try {
        // Get all messages in the conversation
        const allMessages = await storage.getMessagesByNegotiation(negotiationId);
        const supplier = await storage.getSupplier(negotiation.supplierId);
        
        // Format messages for OpenAI
        const conversationHistory = allMessages.map(msg => {
          let role = "user";
          if (msg.senderType === "ai") role = "assistant";
          else if (msg.senderType === "system") role = "system";
          
          return {
            role,
            content: msg.content
          };
        });
        
        // Generate AI response
        const aiResponse = await generateNegotiationResponse(
          supplier?.name || "Supplier",
          negotiation.category,
          negotiation.objectives,
          conversationHistory
        );
        
        // Save AI response
        const aiMessage = await storage.createMessage({
          negotiationId,
          senderId: "ai",
          senderType: "ai",
          content: aiResponse,
          metadata: null
        });
        
        // Return both messages
        res.status(201).json({
          userMessage: message,
          aiMessage
        });
      } catch (err) {
        console.error("Error generating AI response:", err);
        // Still return the user message even if AI generation fails
        res.status(201).json({
          userMessage: message,
          error: "Failed to generate AI response"
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Error creating message" });
    }
  });
  
  // Invitation routes
  app.post("/api/negotiations/:id/invitations", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized to create invitations
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to create invitations for this negotiation" });
      }
      
      // Create token for the invitation
      const token = randomUUID();
      
      const invitationData = {
        negotiationId,
        supplierId: parseInt(req.body.supplierId),
        email: req.body.email,
        token,
        status: "pending"
      };
      
      const validatedData = insertInvitationSchema.parse(invitationData);
      const invitation = await storage.createInvitation(validatedData);
      
      // In a real app, would send an email with the invitation link
      res.status(201).json(invitation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Error creating invitation" });
    }
  });
  
  // Supplier portal route - accessed via invitation token
  app.get("/api/invitation/:token", async (req, res) => {
    try {
      const invitation = await storage.getInvitationByToken(req.params.token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      const negotiation = await storage.getNegotiation(invitation.negotiationId);
      const supplier = await storage.getSupplier(invitation.supplierId);
      
      if (!negotiation || !supplier) {
        return res.status(404).json({ message: "Negotiation or supplier not found" });
      }
      
      // Return negotiation details for supplier
      res.json({
        invitation,
        negotiation: {
          id: negotiation.id,
          title: negotiation.title,
          category: negotiation.category,
          status: negotiation.status
        },
        supplier: {
          id: supplier.id,
          name: supplier.name
        }
      });
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ message: "Error fetching invitation" });
    }
  });
  
  // Supplier sends message through invitation
  app.post("/api/invitation/:token/messages", async (req, res) => {
    try {
      const invitation = await storage.getInvitationByToken(req.params.token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      const negotiation = await storage.getNegotiation(invitation.negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Create supplier message
      const messageData = {
        negotiationId: negotiation.id,
        senderId: invitation.supplierId.toString(),
        senderType: "supplier",
        content: req.body.content,
        metadata: req.body.metadata || null
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      
      // Update negotiation status if it's the first supplier message
      if (negotiation.status === "pending") {
        await storage.updateNegotiation(negotiation.id, { status: "active" });
      }
      
      // Generate AI response
      try {
        // Get all messages in the conversation
        const allMessages = await storage.getMessagesByNegotiation(negotiation.id);
        const supplier = await storage.getSupplier(invitation.supplierId);
        
        // Format messages for OpenAI
        const conversationHistory = allMessages.map(msg => {
          let role = "user";
          if (msg.senderType === "ai") role = "assistant";
          else if (msg.senderType === "system") role = "system";
          
          return {
            role,
            content: msg.content
          };
        });
        
        // Generate AI response
        const aiResponse = await generateNegotiationResponse(
          supplier?.name || "Supplier",
          negotiation.category,
          negotiation.objectives,
          conversationHistory
        );
        
        // Save AI response
        const aiMessage = await storage.createMessage({
          negotiationId: negotiation.id,
          senderId: "ai",
          senderType: "ai",
          content: aiResponse,
          metadata: null
        });
        
        // Return both messages
        res.status(201).json({
          supplierMessage: message,
          aiMessage
        });
      } catch (err) {
        console.error("Error generating AI response:", err);
        // Still return the supplier message even if AI generation fails
        res.status(201).json({
          supplierMessage: message,
          error: "Failed to generate AI response"
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating supplier message:", error);
      res.status(500).json({ message: "Error creating supplier message" });
    }
  });
  
  // Complete negotiation
  app.post("/api/negotiations/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized to complete this negotiation
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to complete this negotiation" });
      }
      
      // Analyze negotiation outcome
      const messages = await storage.getMessagesByNegotiation(negotiationId);
      
      // Get the last few messages to analyze the final agreement
      const finalMessages = messages.slice(-10).map(m => m.content).join("\n");
      
      try {
        const analysis = await analyzeNegotiationResult(negotiation.objectives, finalMessages);
        
        // Update negotiation with results
        const updatedNegotiation = await storage.updateNegotiation(negotiationId, {
          status: "completed",
          completedAt: new Date(),
          outcome: analysis.overallSuccess > 7 ? "success" : analysis.overallSuccess > 4 ? "partial" : "failure",
          savingsPercentage: analysis.savingsEstimate
        });
        
        // Create system message about completion
        await storage.createMessage({
          negotiationId,
          senderId: "system",
          senderType: "system",
          content: "Negotiation completed",
          metadata: { analysis }
        });
        
        res.json({
          negotiation: updatedNegotiation,
          analysis
        });
      } catch (err) {
        console.error("Error analyzing negotiation result:", err);
        
        // Still complete the negotiation even if analysis fails
        const updatedNegotiation = await storage.updateNegotiation(negotiationId, {
          status: "completed",
          completedAt: new Date()
        });
        
        await storage.createMessage({
          negotiationId,
          senderId: "system",
          senderType: "system",
          content: "Negotiation completed",
          metadata: { error: "Could not analyze results" }
        });
        
        res.json({
          negotiation: updatedNegotiation,
          error: "Failed to analyze negotiation result"
        });
      }
    } catch (error) {
      console.error("Error completing negotiation:", error);
      res.status(500).json({ message: "Error completing negotiation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
