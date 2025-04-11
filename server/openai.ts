import OpenAI from "openai";
import { backOff } from 'exponential-backoff';

// Initialize OpenAI API client with better error handling
let openai: OpenAI;
let isOpenAIConfigured = false;

try {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("Warning: OPENAI_API_KEY is not set. AI negotiation features will return simulated responses.");
  } else {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    isOpenAIConfigured = true;
    console.log("OpenAI client initialized successfully");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

// If OpenAI wasn't configured successfully, create a placeholder instance
if (!isOpenAIConfigured) {
  openai = {} as OpenAI;
}

// Model to use for all API calls
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Fallback model for simpler requests if main model fails
const FALLBACK_MODEL = "gpt-3.5-turbo";

// Maximum number of retries for API calls
const MAX_RETRIES = 3;

// Helper function to categorize errors
function categorizeOpenAIError(error: any): string {
  if (!error) return 'unknown';
  
  if (error.status === 401) return 'authentication';
  if (error.status === 429) return 'rate_limit';
  if (error.status === 500) return 'server';
  if (error.status === 503) return 'service_unavailable';
  
  const message = error.message?.toLowerCase() || '';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('network')) return 'network';
  if (message.includes('capacity')) return 'capacity';
  
  return 'unknown';
}

// Wrapper function to handle OpenAI API calls with retries and fallbacks
async function makeOpenAIRequest<T>(
  requestFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>,
  errorMessage: string = "OpenAI API request failed"
): Promise<T> {
  if (!isOpenAIConfigured) {
    throw new Error("OpenAI API is not configured. Please set OPENAI_API_KEY environment variable.");
  }
  
  try {
    // Use exponential backoff for retries
    return await backOff(() => requestFn(), {
      numOfAttempts: MAX_RETRIES,
      startingDelay: 1000,
      timeMultiple: 2,
      retry: (error) => {
        const errorType = categorizeOpenAIError(error);
        
        // Retry on rate limits, timeouts, capacity issues, and unknown server errors
        const shouldRetry = ['rate_limit', 'timeout', 'capacity', 'server', 'service_unavailable', 'network'].includes(errorType);
        
        if (shouldRetry) {
          console.log(`Retrying OpenAI API call due to ${errorType} error...`);
        }
        
        return shouldRetry;
      }
    });
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);
    
    const errorType = categorizeOpenAIError(error);
    console.log(`OpenAI request failed with error type: ${errorType}`);
    
    // Try fallback function if available
    if (fallbackFn) {
      try {
        console.log("Attempting fallback for OpenAI request...");
        return await fallbackFn();
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error(`${errorMessage} (with fallback): ${error?.message || 'Unknown error'}`);
      }
    }
    
    throw new Error(`${errorMessage}: ${error?.message || 'Unknown error'}`);
  }
}

// System prompts for different negotiation contexts
const SYSTEM_PROMPTS = {
  default: "You are a professional AI negotiator representing a procurement team. Your goal is to negotiate the best deal for your company based on the objectives provided. Be firm but respectful, and use data from past negotiations to support your arguments.",
  
  itHardware: "You are a professional AI negotiator specializing in IT hardware procurement. Your goal is to secure the best pricing, warranty terms, and delivery schedules. Use industry benchmarks and historical data to support your position.",
  
  officeSupplies: "You are a professional AI negotiator for office supplies procurement. Focus on bulk discounts, consistent quality, and reliable delivery schedules. Use historical pricing data to argue for competitive rates.",
  
  logistics: "You are a professional AI negotiator for logistics services. Your priorities include delivery reliability, tracking capabilities, damage rates, and competitive pricing. Use industry standards and historical performance to support your arguments.",
};

// Get the appropriate system prompt based on category
function getSystemPrompt(category: string): string {
  const normalizedCategory = category.toLowerCase();
  
  if (normalizedCategory.includes('it') || normalizedCategory.includes('hardware') || normalizedCategory.includes('computer')) {
    return SYSTEM_PROMPTS.itHardware;
  }
  
  if (normalizedCategory.includes('office') && normalizedCategory.includes('supplies')) {
    return SYSTEM_PROMPTS.officeSupplies;
  }
  
  if (normalizedCategory.includes('logistics') || normalizedCategory.includes('shipping') || normalizedCategory.includes('delivery')) {
    return SYSTEM_PROMPTS.logistics;
  }
  
  return SYSTEM_PROMPTS.default;
}

// Parse past negotiation data to extract insights
export async function analyzePastNegotiations(pastData: string, category: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert in procurement and negotiation analysis. Extract key insights, patterns, and successful negotiation tactics from the provided data.",
        },
        {
          role: "user",
          content: `Please analyze this past negotiation data for ${category} and provide:
          1. Key price points and trends
          2. Successful negotiation tactics
          3. Typical supplier objections and effective counters
          4. Recommended negotiation approach
          
          Past negotiation data:
          ${pastData}
          
          Format your response as JSON with these keys: priceInsights, tactics, objections, recommendedApproach.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error("Error analyzing past negotiations:", error);
    throw new Error("Failed to analyze past negotiations: " + (error?.message || "Unknown error"));
  }
}

// Generate initial negotiation message based on objectives and analysis
export async function generateInitialMessage(
  supplierName: string,
  category: string,
  objectives: string,
  analysis: any
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: getSystemPrompt(category),
        },
        {
          role: "user",
          content: `Generate an initial message to start negotiations with ${supplierName} for ${category} procurement. 
          
          Our objectives are:
          ${objectives}
          
          Based on our analysis of past negotiations:
          - Price insights: ${analysis.priceInsights}
          - Successful tactics: ${analysis.tactics}
          - Recommended approach: ${analysis.recommendedApproach}
          
          Write a professional, concise opening message that establishes our position and opens the negotiation.`,
        },
      ],
    });

    return response.choices[0].message.content || 'Unable to generate message. Please try again.';
  } catch (error: any) {
    console.error("Error generating initial message:", error);
    throw new Error("Failed to generate initial message: " + (error?.message || "Unknown error"));
  }
}

// Generate AI response based on conversation history
export async function generateNegotiationResponse(
  supplierName: string,
  category: string,
  objectives: string,
  conversationHistory: { role: string; content: string }[]
): Promise<string> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: getSystemPrompt(category) + `\n\nYour objectives for this negotiation are: ${objectives}`
      },
      ...conversationHistory.map(message => ({
        role: message.role as "system" | "user" | "assistant",
        content: message.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
    });

    return response.choices[0].message.content || 'Unable to generate response. Please try again.';
  } catch (error: any) {
    console.error("Error generating negotiation response:", error);
    throw new Error("Failed to generate response: " + (error?.message || "Unknown error"));
  }
}

// Analyze final negotiation result
export async function analyzeNegotiationResult(
  initialObjectives: string,
  finalAgreement: string
): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing procurement negotiation outcomes. Evaluate the final agreement against the initial objectives and provide a detailed analysis.",
        },
        {
          role: "user",
          content: `Compare the final negotiation agreement against our initial objectives and provide analysis:
          
          Initial objectives:
          ${initialObjectives}
          
          Final agreement:
          ${finalAgreement}
          
          Provide your analysis as JSON with these keys: 
          - objectivesMet (array of objectives that were successfully met)
          - objectivesNotMet (array of objectives that weren't met)
          - savingsEstimate (estimated percentage savings)
          - overallSuccess (rating from 1-10)
          - keyWins (array of significant achievements)
          - missedOpportunities (array of areas where we could have achieved more)
          - recommendations (array of recommendations for future negotiations)`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error("Error analyzing negotiation result:", error);
    throw new Error("Failed to analyze negotiation result: " + (error?.message || "Unknown error"));
  }
}

/**
 * Generate Porter's Five Forces analysis for a specific category
 * @param category The category name (Level 1 category)
 * @param subcategory Optional Level 2 category
 * @param subcategoryLevel3 Optional Level 3 category
 * @param description Additional context about the purchase
 * @returns Structured Porter's Five Forces analysis
 */
// Default fallback for Porter's Five Forces analysis
const DEFAULT_FIVE_FORCES_ANALYSIS = {
  threatOfNewEntrants: {
    level: 'Medium' as const,
    analysis: 'Analysis could not be generated. Consider researching industry barriers to entry.',
    implications: ['Research industry-specific barriers to entry', 'Consider typical startup costs in the industry']
  },
  bargainingPowerOfBuyers: {
    level: 'Medium' as const,
    analysis: 'Analysis could not be generated. Consider researching buyer concentration and switching costs.',
    implications: ['Evaluate how many buyers exist in the market', 'Research typical buyer switching costs']
  },
  threatOfSubstitutes: {
    level: 'Medium' as const,
    analysis: 'Analysis could not be generated. Consider researching available alternatives.',
    implications: ['Identify potential substitute products/services', 'Assess price-performance trade-offs']
  },
  bargainingPowerOfSuppliers: {
    level: 'Medium' as const,
    analysis: 'Analysis could not be generated. Consider researching supplier concentration and uniqueness.',
    implications: ['Review the number of suppliers in the market', 'Evaluate forward integration possibility']
  },
  competitiveRivalry: {
    level: 'Medium' as const,
    analysis: 'Analysis could not be generated. Consider researching competition intensity.',
    implications: ['Assess industry growth rate', 'Evaluate industry concentration']
  },
  overallAssessment: 'A comprehensive market assessment could not be generated. Consider researching industry dynamics and supplier landscape manually.',
  negotiationStrategies: [
    'Research the supplier market thoroughly before negotiation',
    'Prepare alternative options to improve your negotiation position',
    'Consider industry benchmarks for pricing and terms'
  ]
};

export async function generatePortersFiveForces(
  category: string,
  subcategory?: string,
  subcategoryLevel3?: string,
  description?: string
): Promise<{
  threatOfNewEntrants: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  bargainingPowerOfBuyers: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  threatOfSubstitutes: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  bargainingPowerOfSuppliers: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  competitiveRivalry: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  overallAssessment: string;
  negotiationStrategies: string[];
}> {
  // Create full category path for better context
  const fullCategory = [category, subcategory, subcategoryLevel3]
    .filter(Boolean)
    .join(" > ");
  
  const prompt = `
    Generate a Porter's Five Forces analysis for the following procurement category: ${fullCategory}
    ${description ? `\nAdditional context: ${description}` : ''}
    
    For each of the five forces, provide:
    1. An assessment level (Low, Medium, or High)
    2. A concise analysis explaining the reasoning
    3. Specific implications for negotiation
    
    Finally, provide an overall assessment and recommended negotiation strategies.
    
    Format your response as JSON with the following structure:
    {
      "threatOfNewEntrants": {
        "level": "Low/Medium/High",
        "analysis": "concise explanation",
        "implications": ["implication 1", "implication 2", ...]
      },
      "bargainingPowerOfBuyers": {
        "level": "Low/Medium/High",
        "analysis": "concise explanation",
        "implications": ["implication 1", "implication 2", ...]
      },
      "threatOfSubstitutes": {
        "level": "Low/Medium/High",
        "analysis": "concise explanation",
        "implications": ["implication 1", "implication 2", ...]
      },
      "bargainingPowerOfSuppliers": {
        "level": "Low/Medium/High",
        "analysis": "concise explanation",
        "implications": ["implication 1", "implication 2", ...]
      },
      "competitiveRivalry": {
        "level": "Low/Medium/High",
        "analysis": "concise explanation",
        "implications": ["implication 1", "implication 2", ...]
      },
      "overallAssessment": "summary of market dynamics and negotiation position",
      "negotiationStrategies": ["strategy 1", "strategy 2", ...]
    }
  `;
  
  // Primary request function using the main model
  const primaryRequest = async () => {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are a procurement expert specializing in market analysis. Provide insightful Porter's Five Forces analyses that can help procurement professionals develop effective negotiation strategies." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });
    
    const contentStr = completion.choices[0].message.content || '{}';
    const content = JSON.parse(contentStr);
    
    // Ensure the response structure is as expected
    return {
      threatOfNewEntrants: {
        level: content.threatOfNewEntrants?.level || 'Medium',
        analysis: content.threatOfNewEntrants?.analysis || 'Analysis not available',
        implications: content.threatOfNewEntrants?.implications || []
      },
      bargainingPowerOfBuyers: {
        level: content.bargainingPowerOfBuyers?.level || 'Medium',
        analysis: content.bargainingPowerOfBuyers?.analysis || 'Analysis not available',
        implications: content.bargainingPowerOfBuyers?.implications || []
      },
      threatOfSubstitutes: {
        level: content.threatOfSubstitutes?.level || 'Medium',
        analysis: content.threatOfSubstitutes?.analysis || 'Analysis not available',
        implications: content.threatOfSubstitutes?.implications || []
      },
      bargainingPowerOfSuppliers: {
        level: content.bargainingPowerOfSuppliers?.level || 'Medium',
        analysis: content.bargainingPowerOfSuppliers?.analysis || 'Analysis not available',
        implications: content.bargainingPowerOfSuppliers?.implications || []
      },
      competitiveRivalry: {
        level: content.competitiveRivalry?.level || 'Medium',
        analysis: content.competitiveRivalry?.analysis || 'Analysis not available',
        implications: content.competitiveRivalry?.implications || []
      },
      overallAssessment: content.overallAssessment || 'Assessment not available',
      negotiationStrategies: content.negotiationStrategies || []
    };
  };
  
  // Fallback request using a simpler model
  const fallbackRequest = async () => {
    // Try with a simpler model and more concise prompt
    const simplifiedPrompt = `Analyze procurement category: ${fullCategory}. 
    Provide a basic Porter's Five Forces analysis with Low/Medium/High ratings and brief explanations.`;
    
    const completion = await openai.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are a market analysis assistant. Provide brief insights in JSON format." 
        },
        { role: "user", content: simplifiedPrompt }
      ],
      response_format: { type: "json_object" },
    });
    
    const contentStr = completion.choices[0].message.content || '{}';
    let content;
    
    try {
      content = JSON.parse(contentStr);
    } catch (e) {
      console.error("Failed to parse fallback JSON response:", e);
      return DEFAULT_FIVE_FORCES_ANALYSIS;
    }
    
    // Try to extract information from whatever format we got back
    return {
      threatOfNewEntrants: {
        level: (content.threatOfNewEntrants?.level || content.threat_of_new_entrants?.level || 'Medium') as 'Low' | 'Medium' | 'High',
        analysis: content.threatOfNewEntrants?.analysis || content.threat_of_new_entrants?.analysis || 'Simplified analysis not available',
        implications: content.threatOfNewEntrants?.implications || content.threat_of_new_entrants?.implications || ['Research barriers to entry in this industry']
      },
      bargainingPowerOfBuyers: {
        level: (content.bargainingPowerOfBuyers?.level || content.buyer_power?.level || 'Medium') as 'Low' | 'Medium' | 'High',
        analysis: content.bargainingPowerOfBuyers?.analysis || content.buyer_power?.analysis || 'Simplified analysis not available',
        implications: content.bargainingPowerOfBuyers?.implications || content.buyer_power?.implications || ['Assess your value proposition to buyers']
      },
      threatOfSubstitutes: {
        level: (content.threatOfSubstitutes?.level || content.threat_of_substitutes?.level || 'Medium') as 'Low' | 'Medium' | 'High',
        analysis: content.threatOfSubstitutes?.analysis || content.threat_of_substitutes?.analysis || 'Simplified analysis not available',
        implications: content.threatOfSubstitutes?.implications || content.threat_of_substitutes?.implications || ['Identify alternative products/services']
      },
      bargainingPowerOfSuppliers: {
        level: (content.bargainingPowerOfSuppliers?.level || content.supplier_power?.level || 'Medium') as 'Low' | 'Medium' | 'High',
        analysis: content.bargainingPowerOfSuppliers?.analysis || content.supplier_power?.analysis || 'Simplified analysis not available',
        implications: content.bargainingPowerOfSuppliers?.implications || content.supplier_power?.implications || ['Evaluate supplier concentration']
      },
      competitiveRivalry: {
        level: (content.competitiveRivalry?.level || content.competitive_rivalry?.level || 'Medium') as 'Low' | 'Medium' | 'High',
        analysis: content.competitiveRivalry?.analysis || content.competitive_rivalry?.analysis || 'Simplified analysis not available',
        implications: content.competitiveRivalry?.implications || content.competitive_rivalry?.implications || ['Research industry competition']
      },
      overallAssessment: content.overallAssessment || content.overall_assessment || 'A simplified assessment could not be generated.',
      negotiationStrategies: content.negotiationStrategies || content.negotiation_strategies || content.strategies || ['Research the market before negotiation']
    };
  };
  
  // If OpenAI is not configured, return default analysis
  if (!isOpenAIConfigured) {
    console.log("OpenAI not configured, returning default Porter's Five Forces analysis");
    return DEFAULT_FIVE_FORCES_ANALYSIS;
  }
  
  try {
    // Use our robust error handling wrapper
    return await makeOpenAIRequest(
      primaryRequest,
      fallbackRequest,
      "Failed to generate Porter's Five Forces analysis"
    );
  } catch (error) {
    console.error("All attempts to generate Porter's Five Forces analysis failed:", error);
    return DEFAULT_FIVE_FORCES_ANALYSIS;
  }
}
