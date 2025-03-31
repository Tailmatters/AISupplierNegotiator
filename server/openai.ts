import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });

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
      model: "gpt-4o",
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

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error analyzing past negotiations:", error);
    throw new Error("Failed to analyze past negotiations: " + error.message);
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
      model: "gpt-4o",
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

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating initial message:", error);
    throw new Error("Failed to generate initial message: " + error.message);
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
      model: "gpt-4o",
      messages: messages,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating negotiation response:", error);
    throw new Error("Failed to generate response: " + error.message);
  }
}

// Analyze final negotiation result
export async function analyzeNegotiationResult(
  initialObjectives: string,
  finalAgreement: string
): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error analyzing negotiation result:", error);
    throw new Error("Failed to analyze negotiation result: " + error.message);
  }
}
