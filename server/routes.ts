import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzePastNegotiations, generateInitialMessage, generateNegotiationResponse, analyzeNegotiationResult, generatePortersFiveForces } from "./openai";
import { autoCategorize } from "./category-service";
import { parse as csvParse } from 'csv-parse/sync';
import multer from "multer";

// Add multer types to Express namespace
declare global {
  namespace Express {
    // This extends the existing Express namespace
  }
}
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { insertNegotiationSchema, insertSupplierSchema, insertMessageSchema, insertInvitationSchema, insertProposalSchema, insertContractTemplateSchema, insertContractSchema, insertSpendUploadSchema, insertSpendDataSchema, insertApiConnectionSchema, insertDashboardSchema, insertDashboardWidgetSchema, InsertContractTemplate, InsertContract, InsertMessage, InsertSupplier, InsertSpendUpload, InsertSpendData, InsertApiConnection, InsertDashboard, InsertDashboardWidget } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import XLSX from 'xlsx';

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
  
  // Category auto-categorization endpoint
  app.post("/api/categorize", isAuthenticated, async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const result = await autoCategorize(description);
      res.json(result);
    } catch (error) {
      console.error("Error categorizing description:", error);
      res.status(500).json({ message: "Error categorizing description" });
    }
  });
  
  // Porter's Five Forces analysis endpoint
  app.post("/api/porters-five-forces", isAuthenticated, async (req, res) => {
    try {
      const { category, subcategory, subcategoryLevel3, description } = req.body;
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }
      
      const analysis = await generatePortersFiveForces(
        category,
        subcategory,
        subcategoryLevel3,
        description
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Error generating Porter's Five Forces analysis:", error);
      res.status(500).json({ message: "Error generating market analysis" });
    }
  });
  
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
  
  app.patch("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const supplier = await storage.getSupplier(supplierId);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      // Update the supplier
      const updatedSupplier = await storage.updateSupplier(supplierId, req.body);
      
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(updatedSupplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Error updating supplier" });
    }
  });
  
  // Bulk upload suppliers via Excel file
  app.post("/api/suppliers/bulk-upload", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Check if file is an Excel file
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== '.xlsx' && ext !== '.xls') {
        return res.status(400).json({ message: "Invalid file type. Only Excel files (.xlsx, .xls) are allowed." });
      }
      
      // Read the Excel file
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      if (data.length === 0) {
        return res.status(400).json({ message: "The uploaded file contains no data" });
      }
      
      // Validate and process each row
      const results = {
        total: data.length,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      for (const row of data) {
        try {
          // Map Excel columns to supplier fields
          const rowData = row as Record<string, any>;
          const supplierData: InsertSupplier = {
            name: rowData.name || rowData.Name || rowData.NAME || rowData.supplier_name || rowData.SupplierName || '',
            email: rowData.email || rowData.Email || rowData.EMAIL || rowData.contact_email || rowData.ContactEmail || '',
            contactPerson: rowData.contactPerson || rowData.ContactPerson || rowData.contact_person || rowData.CONTACT_PERSON || rowData.contact || '',
            category: rowData.category || rowData.Category || rowData.CATEGORY || rowData.supplier_category || rowData.SupplierCategory || '',
            status: rowData.status || rowData.Status || rowData.STATUS || 'active'
          };
          
          // Validate the data
          try {
            const validatedData = insertSupplierSchema.parse(supplierData);
            await storage.createSupplier(validatedData);
            results.successful++;
          } catch (validationError) {
            if (validationError instanceof z.ZodError) {
              const error = fromZodError(validationError);
              results.errors.push(`Row ${results.successful + results.failed + 1}: ${error.message}`);
            } else {
              results.errors.push(`Row ${results.successful + results.failed + 1}: Unknown validation error`);
            }
            results.failed++;
          }
        } catch (rowError) {
          results.errors.push(`Row ${results.successful + results.failed + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
          results.failed++;
        }
      }
      
      // Delete the temporary file
      fs.unlinkSync(file.path);
      
      res.status(200).json(results);
    } catch (error) {
      console.error("Error uploading suppliers:", error);
      res.status(500).json({ message: "Error processing the Excel file" });
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
  
  app.post("/api/negotiations", isAuthenticated, upload.single('pastData'), async (req: Request, res: Response) => {
    try {
      // If file was uploaded, read its contents
      let pastDataContent = "";
      let pastDataFilePath = "";
      
      const uploadedFile = req.file as Express.Multer.File | undefined;
      if (uploadedFile) {
        pastDataFilePath = uploadedFile.path;
        
        // Read file content if it's a text file
        const ext = path.extname(uploadedFile.originalname).toLowerCase();
        if (ext === '.txt' || ext === '.csv') {
          pastDataContent = fs.readFileSync(uploadedFile.path, 'utf8');
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
  
  // Negotiation feedback endpoint
  app.post("/api/negotiations/:id/feedback", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to submit feedback for this negotiation" });
      }
      
      const { rating, feedback, savingsAmount, savingsPercentage } = req.body;
      
      // Update the negotiation with feedback
      const updatedNegotiation = await storage.updateNegotiation(negotiationId, {
        rating,
        feedback,
        savingsAmount: savingsAmount || 0,
        savingsPercentage: savingsPercentage || 0
      });
      
      // Create a system message to record the feedback
      await storage.createMessage({
        negotiationId,
        senderId: "system",
        senderType: "system",
        content: `Buyer rated the negotiation performance: ${rating}/5 stars`,
        metadata: { 
          event: "feedback_submitted",
          rating,
          feedback,
          savingsAmount,
          savingsPercentage
        }
      });
      
      res.json({ success: true, negotiation: updatedNegotiation });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  });
  
  // Conclude negotiation endpoint
  app.post("/api/negotiations/:id/conclude", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to conclude this negotiation" });
      }
      
      const { approved, additionalInstructions } = req.body;
      
      if (!approved) {
        return res.status(400).json({ message: "Approval status is required" });
      }
      
      // Update the negotiation status
      const updatedNegotiation = await storage.updateNegotiation(negotiationId, {
        status: "completed",
        concludedAt: new Date()
      });
      
      // Get the supplier
      const supplier = await storage.getSupplier(negotiation.supplierId);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      // Get the last messages to determine the final terms
      const messages = await storage.getMessagesByNegotiation(negotiationId);
      
      // Create a conclusion message
      const conclusionMessage = `Negotiation concluded and approved by the buyer. Final terms have been accepted.${additionalInstructions ? `\n\nAdditional notes: ${additionalInstructions}` : ''}`;
      
      await storage.createMessage({
        negotiationId,
        senderId: "system",
        senderType: "system",
        content: conclusionMessage,
        metadata: { 
          event: "negotiation_concluded",
          approvedBy: req.user!.id,
          additionalInstructions
        }
      });
      
      // In a real application, send an email to the supplier
      // For this exercise, we'll just simulate it by creating a message
      const supplierNotificationMessage = `Dear ${supplier.name},\n\nWe are pleased to inform you that our procurement team has concluded the negotiation regarding ${negotiation.category}. The final terms have been approved and we look forward to moving forward with the agreed upon conditions.\n\n${additionalInstructions ? `Additional information: ${additionalInstructions}\n\n` : ''}Thank you for your cooperation throughout this process.\n\nBest regards,\nAI Negotiator on behalf of the Procurement Team`;
      
      await storage.createMessage({
        negotiationId,
        senderId: "system",
        senderType: "system",
        content: supplierNotificationMessage,
        metadata: { 
          event: "supplier_notification",
          notificationType: "conclusion",
          supplierEmail: supplier.email
        }
      });
      
      res.json({ 
        success: true, 
        negotiation: updatedNegotiation,
        supplierNotified: true
      });
    } catch (error) {
      console.error("Error concluding negotiation:", error);
      res.status(500).json({ message: "Error concluding negotiation" });
    }
  });
  
  // Request further negotiation endpoint
  app.post("/api/negotiations/:id/request-further", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to request further negotiation" });
      }
      
      const { instructions } = req.body;
      
      // Update the negotiation to indicate further negotiation requested
      const updatedNegotiation = await storage.updateNegotiation(negotiationId, {
        status: "pending_further"
      });
      
      // Get the supplier
      const supplier = await storage.getSupplier(negotiation.supplierId);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      // Create a system message to record the request
      await storage.createMessage({
        negotiationId,
        senderId: "system",
        senderType: "system",
        content: `Buyer has requested further negotiation. Management input: ${instructions || 'No specific instructions provided.'}`,
        metadata: { 
          event: "further_negotiation_requested",
          requestedBy: req.user!.id,
          instructions
        }
      });
      
      // In a real application, send an email to the supplier
      // For this exercise, we'll just simulate it by creating a message
      const supplierNotificationMessage = `Dear ${supplier.name},\n\nWe would like to continue our negotiation regarding ${negotiation.category}. Our procurement team has reviewed the current terms and would like to discuss further improvements.\n\n${instructions ? `Specific areas to focus on: ${instructions}\n\n` : ''}Please let us know your availability to continue this discussion.\n\nBest regards,\nAI Negotiator on behalf of the Procurement Team`;
      
      await storage.createMessage({
        negotiationId,
        senderId: "system",
        senderType: "system",
        content: supplierNotificationMessage,
        metadata: { 
          event: "supplier_notification",
          notificationType: "further_negotiation",
          supplierEmail: supplier.email
        }
      });
      
      // Generate AI response to restart the negotiation
      let aiResponse = '';
      try {
        // Get all messages in the conversation
        const messages = await storage.getMessagesByNegotiation(negotiationId);
        
        // Format messages for OpenAI
        const conversationHistory = messages
          .filter(msg => msg.senderType !== 'system' || (msg.metadata as any)?.event === 'negotiation_started')
          .map(msg => {
            let role = "user";
            if (msg.senderType === "ai") role = "assistant";
            else if (msg.senderType === "system") role = "system";
            
            return {
              role,
              content: msg.content
            };
          });
        
        // Add the new instructions from management as context
        conversationHistory.push({
          role: "system",
          content: `The buyer wants to continue negotiation with these additional instructions: ${instructions || 'No specific instructions provided, but they are seeking a better deal.'}. Restart the negotiation based on this feedback.`
        });
        
        // Generate AI response
        aiResponse = await generateNegotiationResponse(
          supplier.name,
          negotiation.category,
          `${negotiation.objectives}\n\nAdditional management input: ${instructions}`,
          conversationHistory
        );
        
        // Save AI message
        await storage.createMessage({
          negotiationId,
          senderId: "ai",
          senderType: "ai",
          content: aiResponse,
          metadata: { event: "negotiation_continued" }
        });
      } catch (err) {
        console.error("Error generating AI response for continued negotiation:", err);
        // Continue even if AI response generation fails
      }
      
      res.json({ 
        success: true, 
        negotiation: updatedNegotiation,
        supplierNotified: true,
        aiResponse
      });
    } catch (error) {
      console.error("Error requesting further negotiation:", error);
      res.status(500).json({ message: "Error requesting further negotiation" });
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
  
  // Supplier proposal endpoints
  app.post("/api/invitation/:token/proposals", upload.single('file'), async (req: Request, res: Response) => {
    try {
      const invitation = await storage.getInvitationByToken(req.params.token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      const negotiation = await storage.getNegotiation(invitation.negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Verify file was uploaded
      const uploadedFile = req.file as Express.Multer.File | undefined;
      if (!uploadedFile) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Create proposal
      const proposalData = {
        negotiationId: negotiation.id,
        supplierId: invitation.supplierId,
        filePath: uploadedFile.path,
        fileName: uploadedFile.originalname,
        fileSize: uploadedFile.size,
        description: req.body.description || null,
        amount: req.body.amount ? parseFloat(req.body.amount) : null,
        status: "pending",
        metadata: req.body.metadata || null
      };
      
      try {
        const validatedData = insertProposalSchema.parse(proposalData);
        const proposal = await storage.createProposal(validatedData);
        
        // Create system message about proposal submission
        await storage.createMessage({
          negotiationId: negotiation.id,
          senderId: "system",
          senderType: "system",
          content: `Supplier submitted a proposal: ${uploadedFile.originalname}`,
          metadata: { event: "proposal_submitted", proposalId: proposal.id }
        });
        
        res.status(201).json(proposal);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const error = fromZodError(validationError);
          return res.status(400).json({ message: error.message });
        }
        throw validationError;
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Error creating proposal" });
    }
  });
  
  // Get proposals for a negotiation (admin)
  app.get("/api/negotiations/:id/proposals", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized to view proposals
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view proposals for this negotiation" });
      }
      
      const proposals = await storage.getProposalsByNegotiation(negotiationId);
      
      // For each proposal, get the supplier details
      const proposalsWithSupplierInfo = await Promise.all(
        proposals.map(async (proposal) => {
          const supplier = await storage.getSupplier(proposal.supplierId);
          return {
            ...proposal,
            supplier: supplier ? {
              name: supplier.name,
              email: supplier.email
            } : null
          };
        })
      );
      
      res.json(proposalsWithSupplierInfo);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Error fetching proposals" });
    }
  });
  
  // Update proposal status (accept/reject)
  app.patch("/api/proposals/:id", isAuthenticated, async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const proposal = await storage.getProposal(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      // Get negotiation to verify user permission
      const negotiation = await storage.getNegotiation(proposal.negotiationId);
      
      if (!negotiation || negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this proposal" });
      }
      
      // Only allow status update
      const updatedProposal = await storage.updateProposal(proposalId, {
        status: req.body.status
      });
      
      // Create system message about proposal status change
      await storage.createMessage({
        negotiationId: proposal.negotiationId,
        senderId: "system",
        senderType: "system",
        content: `Proposal ${req.body.status}: ${proposal.fileName}`,
        metadata: { event: "proposal_status_change", proposalId, status: req.body.status }
      });
      
      res.json(updatedProposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Error updating proposal" });
    }
  });
  
  // Complete negotiation
  // Performance rating endpoint
  app.post("/api/negotiations/:id/performance", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Check if user is authorized
      if (negotiation.createdBy !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to rate this negotiation" });
      }
      
      const { rating, feedback, savingsAmount, savingsPercentage } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Valid rating (1-5) is required" });
      }
      
      // Update the negotiation with the performance rating
      const updatedNegotiation = await storage.updateNegotiation(negotiationId, {
        rating: rating,
        feedback: feedback || null,
        savingsAmount: savingsAmount || 0,
        savingsPercentage: savingsPercentage || 0,
        // Note: We're using the existing fields in the schema
      });
      
      res.json({ 
        success: true, 
        negotiation: updatedNegotiation
      });
    } catch (error) {
      console.error("Error saving performance rating:", error);
      res.status(500).json({ message: "Error saving performance rating" });
    }
  });

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

  // Contract Templates endpoints
  app.get("/api/contract-templates", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const templates = await storage.getContractTemplatesForUser(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching contract templates:", error);
      res.status(500).json({ error: "Failed to fetch contract templates" });
    }
  });
  
  app.get("/api/contract-templates/category/:category", isAuthenticated, async (req, res) => {
    try {
      const category = req.params.category;
      const templates = await storage.getContractTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching contract templates by category:", error);
      res.status(500).json({ error: "Failed to fetch contract templates" });
    }
  });
  
  app.post("/api/contract-templates", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      const userId = req.user!.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No template file uploaded" });
      }
      
      const insertTemplate: InsertContractTemplate = {
        name: req.body.name,
        category: req.body.category,
        filePath: file.path,
        fileName: file.originalname,
        fileSize: file.size,
        createdBy: userId,
        description: req.body.description || null,
        isDefault: req.body.isDefault === 'true' || req.body.isDefault === true,
        status: req.body.status || 'active',
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : null
      };
      
      const template = await storage.createContractTemplate(insertTemplate);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating contract template:", error);
      res.status(500).json({ error: "Failed to create contract template" });
    }
  });
  
  app.put("/api/contract-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get the template to verify ownership
      const template = await storage.getContractTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ error: "Contract template not found" });
      }
      
      if (template.createdBy !== userId) {
        return res.status(403).json({ error: "You don't have permission to update this template" });
      }
      
      const updatedTemplate = await storage.updateContractTemplate(templateId, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating contract template:", error);
      res.status(500).json({ error: "Failed to update contract template" });
    }
  });
  
  // Contract endpoints
  app.get("/api/contracts", isAuthenticated, async (req, res) => {
    try {
      // Get contract by negotiation ID if provided
      if (req.query.negotiationId) {
        const negotiationId = parseInt(req.query.negotiationId as string);
        const contracts = await storage.getContractsByNegotiation(negotiationId);
        return res.json(contracts);
      }
      
      // Get contract by supplier ID if provided
      if (req.query.supplierId) {
        const supplierId = parseInt(req.query.supplierId as string);
        const contracts = await storage.getContractsBySupplier(supplierId);
        return res.json(contracts);
      }
      
      // Otherwise return 400 - must specify negotiationId or supplierId
      res.status(400).json({ error: "Must specify negotiationId or supplierId" });
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });
  
  app.get("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });
  
  app.post("/api/contracts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Check if user has access to the negotiation
      const negotiationId = req.body.negotiationId;
      const negotiation = await storage.getNegotiation(negotiationId);
      
      if (!negotiation) {
        return res.status(404).json({ error: "Negotiation not found" });
      }
      
      if (negotiation.createdBy !== userId) {
        return res.status(403).json({ error: "You don't have permission to create contracts for this negotiation" });
      }
      
      const insertContract: InsertContract = {
        negotiationId: req.body.negotiationId,
        supplierId: req.body.supplierId,
        filePath: req.body.filePath,
        fileName: req.body.fileName,
        proposalId: req.body.proposalId || null,
        templateId: req.body.templateId || null,
        status: req.body.status || 'draft',
        terms: req.body.terms || null,
        metadata: req.body.metadata || null
      };
      
      const contract = await storage.createContract(insertContract);
      
      // Create a message in the negotiation to notify about the contract
      const message: InsertMessage = {
        negotiationId: negotiationId,
        senderId: userId.toString(),
        senderType: "user",
        content: `Contract "${req.body.fileName}" has been created`,
        metadata: { contractId: contract.id }
      };
      
      await storage.createMessage(message);
      
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ error: "Failed to create contract" });
    }
  });
  
  app.put("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Get the contract and check if user has access to it
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Get the negotiation to verify ownership
      const negotiation = await storage.getNegotiation(contract.negotiationId);
      
      if (negotiation && negotiation.createdBy !== userId) {
        return res.status(403).json({ error: "You don't have permission to update this contract" });
      }
      
      const updatedContract = await storage.updateContract(contractId, req.body);
      
      // If status was updated to approved, create a message
      if (req.body.status === 'approved' && contract.status !== 'approved') {
        const message: InsertMessage = {
          negotiationId: contract.negotiationId,
          senderId: userId.toString(),
          senderType: "user",
          content: `Contract "${contract.fileName}" has been approved`,
          metadata: { contractId: contract.id }
        };
        
        await storage.createMessage(message);
      }
      
      // If status was updated to signed, create a message
      if (req.body.status === 'signed' && contract.status !== 'signed') {
        const message: InsertMessage = {
          negotiationId: contract.negotiationId,
          senderId: userId.toString(),
          senderType: "user",
          content: `Contract "${contract.fileName}" has been signed`,
          metadata: { contractId: contract.id }
        };
        
        await storage.createMessage(message);
      }
      
      res.json(updatedContract);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(500).json({ error: "Failed to update contract" });
    }
  });
  
  // Spend Analysis routes
  // Upload spend data
  app.post("/api/spend/upload", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const file = req.file;
      const userId = req.user!.id;
      
      // Create a spend upload record
      const uploadData: InsertSpendUpload = {
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: path.extname(file.originalname).toLowerCase().replace('.', ''),
        source: 'csv_upload',
        status: 'processing'
      };
      
      const spendUpload = await storage.createSpendUpload(uploadData);
      
      // Process file asynchronously - we'll update the status later
      try {
        // Read the file
        const fileData = fs.readFileSync(file.path, 'utf8');
        
        // Check file type and process accordingly
        const ext = path.extname(file.originalname).toLowerCase();
        let records: any[] = [];
        
        if (ext === '.csv') {
          // Simple CSV parsing (for more complex CSVs, use a proper CSV parser library)
          const lines = fileData.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = lines[i].split(',').map(v => v.trim());
            const record: Record<string, any> = {};
            
            headers.forEach((header, index) => {
              if (index < values.length) {
                record[header] = values[index];
              }
            });
            
            records.push(record);
          }
        } else if (ext === '.xlsx' || ext === '.xls') {
          // Process Excel file
          const workbook = XLSX.readFile(file.path);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          records = XLSX.utils.sheet_to_json(worksheet);
        } else {
          throw new Error(`Unsupported file type: ${ext}`);
        }
        
        if (records.length === 0) {
          throw new Error("No data found in file");
        }
        
        // Map records to SpendData schema
        const spendDataItems: InsertSpendData[] = records.map(record => {
          // Try to find a matching supplier
          let supplierId = null;
          
          // Create base spend data record with required fields
          return {
            userId,
            uploadId: spendUpload.id,
            supplierName: record.supplier || record.Supplier || record.supplier_name || record.SupplierName || record.SUPPLIER || "Unknown Supplier",
            supplierId, // Will be updated if we can match the supplier
            category: record.category || record.Category || record.CATEGORY || "Uncategorized",
            subcategory: record.subcategory || record.Subcategory || record.sub_category || null,
            spendAmount: record.amount || record.Amount || record.AMOUNT || record.spend || record.Spend || "0",
            currency: record.currency || record.Currency || record.CURRENCY || "USD",
            quantity: record.quantity || record.Quantity || record.QUANTITY || null,
            unitPrice: record.unit_price || record.unitPrice || record.UnitPrice || record.price || null,
            itemDescription: record.description || record.Description || record.item_description || null,
            departmentId: record.department_id || record.departmentId || record.DepartmentId || null,
            departmentName: record.department || record.Department || record.department_name || null,
            invoiceNumber: record.invoice || record.Invoice || record.invoice_number || record.InvoiceNumber || null,
            poNumber: record.po || record.PO || record.po_number || record.PoNumber || null,
            transactionDate: record.date || record.Date || record.transaction_date || record.TransactionDate ? new Date(record.date || record.Date || record.transaction_date || record.TransactionDate) : new Date(),
            dataSource: 'csv_upload'
          };
        });
        
        // Create the spend data records
        await storage.createManySpendData(spendDataItems);
        
        // Update the upload status
        await storage.updateSpendUpload(spendUpload.id, {
          status: 'completed',
          recordCount: spendDataItems.length,
          processingCompletedAt: new Date()
        });
        
        // Delete the temporary file
        fs.unlinkSync(file.path);
        
      } catch (processError) {
        console.error("Error processing spend data file:", processError);
        
        // Update the upload status to failed
        await storage.updateSpendUpload(spendUpload.id, {
          status: 'failed',
          errorMessage: processError instanceof Error ? processError.message : 'Unknown error processing file',
          processingCompletedAt: new Date()
        });
        
        // Don't fail the response, we'll return the upload record
      }
      
      res.status(201).json(spendUpload);
    } catch (error) {
      console.error("Error uploading spend data:", error);
      res.status(500).json({ message: "Error uploading spend data" });
    }
  });
  
  // Get spend uploads
  app.get("/api/spend/uploads", isAuthenticated, async (req, res) => {
    try {
      const uploads = await storage.getSpendUploadsByUser(req.user!.id);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching spend uploads:", error);
      res.status(500).json({ message: "Error fetching spend uploads" });
    }
  });
  
  // Get spend by supplier
  app.get("/api/spend/by-supplier", isAuthenticated, async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const data = await storage.getSpendBySupplier(req.user!.id, year);
      res.json(data);
    } catch (error) {
      console.error("Error fetching spend by supplier:", error);
      res.status(500).json({ message: "Error fetching spend by supplier" });
    }
  });
  
  // Get spend by category
  app.get("/api/spend/by-category", isAuthenticated, async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const data = await storage.getSpendByCategory(req.user!.id, year);
      res.json(data);
    } catch (error) {
      console.error("Error fetching spend by category:", error);
      res.status(500).json({ message: "Error fetching spend by category" });
    }
  });
  
  // Get spend by year
  app.get("/api/spend/by-year", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getSpendByYear(req.user!.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching spend by year:", error);
      res.status(500).json({ message: "Error fetching spend by year" });
    }
  });
  
  // Get top suppliers
  app.get("/api/spend/top-suppliers", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const data = await storage.getTopSuppliers(req.user!.id, limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching top suppliers:", error);
      res.status(500).json({ message: "Error fetching top suppliers" });
    }
  });
  
  // Get spend data records
  app.get("/api/spend/data", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getSpendDataByUser(req.user!.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching spend data:", error);
      res.status(500).json({ message: "Error fetching spend data" });
    }
  });
  
  // Dashboard Widget API endpoints
  // Get all widget types
  app.get("/api/widget-types", isAuthenticated, async (req, res) => {
    try {
      const widgetTypes = await storage.getAllWidgetTypes();
      res.json(widgetTypes);
    } catch (error) {
      console.error("Error fetching widget types:", error);
      res.status(500).json({ message: "Error fetching widget types" });
    }
  });
  
  // Get widget types by category
  app.get("/api/widget-types/category/:category", isAuthenticated, async (req, res) => {
    try {
      const widgetTypes = await storage.getWidgetTypesByCategory(req.params.category);
      res.json(widgetTypes);
    } catch (error) {
      console.error("Error fetching widget types by category:", error);
      res.status(500).json({ message: "Error fetching widget types by category" });
    }
  });
  
  // Get widget type by ID
  app.get("/api/widget-types/:id", isAuthenticated, async (req, res) => {
    try {
      const widgetType = await storage.getWidgetType(parseInt(req.params.id));
      if (!widgetType) {
        return res.status(404).json({ message: "Widget type not found" });
      }
      res.json(widgetType);
    } catch (error) {
      console.error("Error fetching widget type:", error);
      res.status(500).json({ message: "Error fetching widget type" });
    }
  });
  
  // Get widget data by widget type ID
  app.get("/api/widget-data/:widgetTypeId", isAuthenticated, async (req, res) => {
    try {
      const widgetTypeId = parseInt(req.params.widgetTypeId);
      const widgetType = await storage.getWidgetType(widgetTypeId);
      
      if (!widgetType) {
        return res.status(404).json({ message: "Widget type not found" });
      }
      
      const userId = req.user!.id;
      let data: any = null;
      
      // Get data based on widget type
      switch (widgetType.type) {
        case 'recent-negotiations':
          const negotiations = await storage.getNegotiationsByUser(userId);
          data = {
            negotiations: negotiations.slice(0, 5).map(n => ({
              id: n.id,
              title: n.title,
              category: n.category,
              status: n.status,
              date: n.startedAt
            }))
          };
          break;
          
        case 'category-summary':
          const categoryData = await storage.getSpendByCategory();
          // Generate colors for each category
          const colors = ['#4f46e5', '#0ea5e9', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#ef4444', '#ec4899'];
          data = {
            categories: categoryData.map((item, index) => ({
              name: item.category,
              amount: parseFloat(item.total.toString()),
              color: colors[index % colors.length]
            }))
          };
          break;
          
        case 'top-suppliers':
          const topSuppliers = await storage.getTopSuppliers();
          data = {
            suppliers: topSuppliers.map(s => ({
              id: s.supplierId,
              name: s.supplierName,
              spend: parseFloat(s.total.toString())
            }))
          };
          break;
          
        case 'spend-by-year':
          const yearlyData = await storage.getSpendByYear();
          const years = yearlyData.map(y => ({
            year: y.year,
            total: parseFloat(y.total.toString())
          }));
          
          // Calculate max total for the bar chart
          const maxTotal = Math.max(...years.map(y => y.total));
          
          data = {
            years,
            maxTotal
          };
          break;
          
        default:
          data = { message: "Widget type not implemented" };
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching widget data:", error);
      res.status(500).json({ message: "Error fetching widget data" });
    }
  });
  
  // Dashboard endpoints
  // Get user's dashboards
  app.get("/api/dashboards", isAuthenticated, async (req, res) => {
    try {
      const dashboards = await storage.getDashboardsByUser(req.user!.id);
      res.json(dashboards);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ message: "Error fetching dashboards" });
    }
  });
  
  // Get user's default dashboard with widgets
  app.get("/api/dashboards/default", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      let dashboard = await storage.getUserDefaultDashboard(userId);
      
      // Create default dashboard if it doesn't exist
      if (!dashboard) {
        dashboard = await storage.createDashboard({
          name: "My Dashboard",
          userId,
          isDefault: true,
          layout: {}
        });
      }
      
      // Get widgets for this dashboard
      const widgets = await storage.getDashboardWidgetsByDashboard(dashboard.id);
      
      // Get widget types for each widget
      const widgetsWithTypes = await Promise.all(
        widgets.map(async (widget) => {
          const widgetType = await storage.getWidgetType(widget.widgetTypeId);
          return {
            ...widget,
            widgetType
          };
        })
      );
      
      // Return dashboard with widgets
      res.json({
        ...dashboard,
        widgets: widgetsWithTypes
      });
    } catch (error) {
      console.error("Error fetching default dashboard:", error);
      res.status(500).json({ message: "Error fetching default dashboard" });
    }
  });
  
  // Get dashboard by ID with widgets and widget types
  app.get("/api/dashboards/:id", isAuthenticated, async (req, res) => {
    try {
      const dashboard = await storage.getDashboard(parseInt(req.params.id));
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check if the user owns this dashboard
      if (dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this dashboard" });
      }
      
      // Get the widgets for this dashboard
      const widgets = await storage.getDashboardWidgetsByDashboard(dashboard.id);
      
      // Get widget types for each widget
      const widgetsWithTypes = await Promise.all(
        widgets.map(async (widget) => {
          const widgetType = await storage.getWidgetType(widget.widgetTypeId);
          return {
            ...widget,
            widgetType
          };
        })
      );
      
      res.json({
        ...dashboard,
        widgets: widgetsWithTypes
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Error fetching dashboard" });
    }
  });
  
  // Create a new dashboard
  app.post("/api/dashboards", isAuthenticated, async (req, res) => {
    try {
      const dashboardData = {
        ...req.body,
        userId: req.user!.id
      };
      
      const validatedData = insertDashboardSchema.parse(dashboardData);
      const dashboard = await storage.createDashboard(validatedData);
      res.status(201).json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating dashboard:", error);
      res.status(500).json({ message: "Error creating dashboard" });
    }
  });
  
  // Update a dashboard
  app.patch("/api/dashboards/:id", isAuthenticated, async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.id);
      const dashboard = await storage.getDashboard(dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check if the user owns this dashboard
      if (dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this dashboard" });
      }
      
      const updatedDashboard = await storage.updateDashboard(dashboardId, req.body);
      res.json(updatedDashboard);
    } catch (error) {
      console.error("Error updating dashboard:", error);
      res.status(500).json({ message: "Error updating dashboard" });
    }
  });
  
  // Delete a dashboard
  app.delete("/api/dashboards/:id", isAuthenticated, async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.id);
      const dashboard = await storage.getDashboard(dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check if the user owns this dashboard
      if (dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this dashboard" });
      }
      
      const deleted = await storage.deleteDashboard(dashboardId);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete dashboard" });
      }
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      res.status(500).json({ message: "Error deleting dashboard" });
    }
  });
  
  // Dashboard Widget endpoints
  // Get widget by ID with widget type information
  app.get("/api/dashboard-widgets/:id", isAuthenticated, async (req, res) => {
    try {
      const widget = await storage.getDashboardWidget(parseInt(req.params.id));
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Check if the user owns the dashboard this widget belongs to
      const dashboard = await storage.getDashboard(widget.dashboardId);
      
      if (!dashboard || dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to access this widget" });
      }
      
      // Get the widget type
      const widgetType = await storage.getWidgetType(widget.widgetTypeId);
      
      // Return widget with widget type
      res.json({
        ...widget,
        widgetType
      });
    } catch (error) {
      console.error("Error fetching dashboard widget:", error);
      res.status(500).json({ message: "Error fetching dashboard widget" });
    }
  });
  
  // Create a new widget
  app.post("/api/dashboard-widgets", isAuthenticated, async (req, res) => {
    try {
      const widgetData = req.body;
      
      // Verify the dashboard exists and belongs to the user
      const dashboard = await storage.getDashboard(widgetData.dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      if (dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to add widgets to this dashboard" });
      }
      
      // Validate the data
      const validatedData = insertDashboardWidgetSchema.parse(widgetData);
      
      // Create the widget
      const widget = await storage.createDashboardWidget(validatedData);
      
      // Get the widget type
      const widgetType = await storage.getWidgetType(widget.widgetTypeId);
      
      // Return widget with widget type
      res.status(201).json({
        ...widget,
        widgetType
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating dashboard widget:", error);
      res.status(500).json({ message: "Error creating dashboard widget" });
    }
  });
  
  // Update a widget
  app.patch("/api/dashboard-widgets/:id", isAuthenticated, async (req, res) => {
    try {
      const widgetId = parseInt(req.params.id);
      const widget = await storage.getDashboardWidget(widgetId);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Check if the user owns the dashboard this widget belongs to
      const dashboard = await storage.getDashboard(widget.dashboardId);
      
      if (!dashboard || dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this widget" });
      }
      
      const updatedWidget = await storage.updateDashboardWidget(widgetId, req.body);
      
      // Get the widget type
      const widgetType = await storage.getWidgetType(updatedWidget.widgetTypeId);
      
      // Return updated widget with widget type
      res.json({
        ...updatedWidget,
        widgetType
      });
    } catch (error) {
      console.error("Error updating dashboard widget:", error);
      res.status(500).json({ message: "Error updating dashboard widget" });
    }
  });
  
  // Delete a widget
  app.delete("/api/dashboard-widgets/:id", isAuthenticated, async (req, res) => {
    try {
      const widgetId = parseInt(req.params.id);
      const widget = await storage.getDashboardWidget(widgetId);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      // Check if the user owns the dashboard this widget belongs to
      const dashboard = await storage.getDashboard(widget.dashboardId);
      
      if (!dashboard || dashboard.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this widget" });
      }
      
      const deleted = await storage.deleteDashboardWidget(widgetId);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete widget" });
      }
    } catch (error) {
      console.error("Error deleting dashboard widget:", error);
      res.status(500).json({ message: "Error deleting dashboard widget" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
