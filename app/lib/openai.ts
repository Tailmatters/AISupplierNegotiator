import OpenAI from "openai";
import { backOff } from "exponential-backoff";

// Check if OpenAI API key is present
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. AI features will not function correctly.");
}

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Create OpenAI client instance
const openai = new OpenAI({ apiKey });

// Error categorization for better handling
function categorizeOpenAIError(error: any): string {
  if (!error) return "unknown";
  
  // API key errors
  if (error.message?.includes("API key")) return "api_key";
  if (error.message?.includes("authentication")) return "authentication";
  
  // Rate limiting errors
  if (error.message?.includes("rate limit")) return "rate_limit";
  if (error.message?.includes("quota")) return "quota";
  
  // Model availability errors
  if (error.message?.includes("model")) return "model_availability";
  
  // Content policy errors
  if (error.message?.includes("content policy")) return "content_policy";
  if (error.message?.includes("violates")) return "content_policy";
  
  // Server errors
  if (error.message?.includes("server")) return "server";
  if (error.status === 500) return "server";
  if (error.status === 502) return "server";
  if (error.status === 503) return "server";
  
  // Context length errors
  if (error.message?.includes("maximum context length")) return "context_length";
  if (error.message?.includes("too long")) return "context_length";
  
  // Parsing errors
  if (error.message?.includes("parse")) return "parsing";
  if (error.message?.includes("JSON")) return "parsing";
  
  // Timeout errors
  if (error.message?.includes("timeout")) return "timeout";
  if (error.message?.includes("timed out")) return "timeout";
  
  // Default case
  return "unknown";
}

// Generic function to make robust OpenAI requests with retry logic
async function makeOpenAIRequest<T>(
  requestFn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  try {
    return await backOff(() => requestFn(), {
      numOfAttempts: maxAttempts,
      startingDelay: 1000,
      timeMultiple: 2,
      retry: (error: any, attemptNumber: number) => {
        const errorType = categorizeOpenAIError(error);
        
        console.warn(
          `OpenAI request failed (attempt ${attemptNumber}/${maxAttempts}): ${error.message}. Error type: ${errorType}`
        );
        
        // Always retry server errors and timeouts
        if (errorType === "server" || errorType === "timeout") return true;
        
        // Retry rate limits only on first retry
        if (errorType === "rate_limit" && attemptNumber < 2) return true;
        
        // Don't retry other errors
        return false;
      },
    });
  } catch (error: any) {
    const errorType = categorizeOpenAIError(error);
    console.error(`OpenAI request failed after ${maxAttempts} attempts: ${error.message}. Error type: ${errorType}`);
    throw error;
  }
}

// System prompts for different functionalities
function getSystemPrompt(category: string): string {
  const basePrompt = `You are an AI-powered procurement assistant specializing in negotiation. `;
  
  switch (category) {
    case "analysis":
      return basePrompt + `Analyze the provided past negotiation data and provide insights that could help in future negotiations.`;
    case "negotiation":
      return basePrompt + `You are negotiating on behalf of the buyer. Your goal is to achieve the best possible terms while maintaining a professional and reasonable tone.`;
    case "strategy":
      return basePrompt + `Provide strategic guidance for upcoming negotiations based on the given context and objectives.`;
    case "market":
      return basePrompt + `Analyze the market conditions and competitive landscape for the given category to support negotiation planning.`;
    default:
      return basePrompt;
  }
}

// API functions
export async function analyzePastNegotiations(pastData: string, category: string): Promise<any> {
  if (!apiKey) throw new Error("OpenAI API key is not configured");
  
  return makeOpenAIRequest(async () => {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: getSystemPrompt("analysis") },
        {
          role: "user",
          content: `Analyze the following past negotiation data for the category "${category}" and provide key insights that could help in future negotiations:\n\n${pastData}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    
    return JSON.parse(completion.choices[0].message.content || "{}");
  });
}

export async function generateInitialMessage(
  objectives: string,
  category: string,
  pastData: string = ""
): Promise<string> {
  if (!apiKey) throw new Error("OpenAI API key is not configured");
  
  return makeOpenAIRequest(async () => {
    let prompt = `Generate an initial message to the supplier for a negotiation in the "${category}" category with the following objectives:\n\n${objectives}`;
    
    if (pastData) {
      prompt += `\n\nHere is data from past negotiations that may be relevant:\n\n${pastData}`;
    }
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: getSystemPrompt("negotiation") },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content || "";
  });
}

export async function generateNegotiationResponse(
  messages: { role: string; content: string }[],
  objectives: string,
  category: string
): Promise<string> {
  if (!apiKey) throw new Error("OpenAI API key is not configured");
  
  return makeOpenAIRequest(async () => {
    const systemPrompt = getSystemPrompt("negotiation") + 
      `\n\nYour negotiation objectives are:\n${objectives}\n\nYou are negotiating in the "${category}" category.`;
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content || "";
  });
}

export async function analyzeNegotiationResult(
  messages: { role: string; content: string }[],
  objectives: string,
  initialOffer: number | null,
  finalOffer: number | null
): Promise<{
  outcome: string;
  savingsPercentage: number | null;
  summary: string;
  rating: number;
  feedback: string;
  nextSteps: string[];
}> {
  if (!apiKey) throw new Error("OpenAI API key is not configured");
  
  return makeOpenAIRequest(async () => {
    let prompt = `Analyze the results of this negotiation based on the messages exchanged and the objectives.`;
    
    if (initialOffer !== null && finalOffer !== null) {
      prompt += `\n\nInitial offer: ${initialOffer}\nFinal offer: ${finalOffer}`;
    }
    
    prompt += `\n\nObjectives:\n${objectives}`;
    
    prompt += `\n\nProvide a JSON response with the following fields:
- outcome: "success", "partial", or "failure" based on how well the objectives were met
- savingsPercentage: The percentage savings achieved (if applicable, otherwise null)
- summary: A brief summary of the negotiation results
- rating: A rating from 1 to 5 on how well the negotiation went
- feedback: Detailed feedback on the negotiation process
- nextSteps: An array of recommended next steps`;
    
    const messagesForAnalysis = messages.slice(0, 15); // Only analyze the most recent messages to avoid token limits
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: getSystemPrompt("analysis") },
        ...messagesForAnalysis,
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    
    return JSON.parse(completion.choices[0].message.content || "{}");
  });
}

// Default analysis in case the API fails
const DEFAULT_FIVE_FORCES_ANALYSIS = {
  supplierPower: {
    level: "medium",
    description: "Moderate supplier power in this category.",
    factors: [
      "Multiple suppliers available",
      "Switching costs are moderate",
      "Products somewhat differentiated"
    ],
    negotiationStrategy: "Focus on creating competition between suppliers."
  },
  buyerPower: {
    level: "medium",
    description: "Moderate buyer power in this market.",
    factors: [
      "Moderate purchase volumes",
      "Some substitutes available",
      "Medium switching costs"
    ],
    negotiationStrategy: "Emphasize relationship value and total cost of ownership."
  },
  substituteThreat: {
    level: "medium",
    description: "Some substitute products/services exist.",
    factors: [
      "Alternative solutions available",
      "Moderate switching costs",
      "Performance trade-offs to consider"
    ],
    negotiationStrategy: "Acknowledge alternatives but highlight unique benefits of preferred solution."
  },
  newEntrantThreat: {
    level: "low",
    description: "Limited threat from new market entrants.",
    factors: [
      "High barriers to entry",
      "Significant capital requirements",
      "Established relationships matter"
    ],
    negotiationStrategy: "Focus on incumbent advantages while staying alert to disruptors."
  },
  competitiveRivalry: {
    level: "high",
    description: "Strong competition among existing vendors.",
    factors: [
      "Many comparable offerings",
      "Price-sensitive market",
      "Ongoing innovation"
    ],
    negotiationStrategy: "Leverage competition to secure better terms."
  },
  summary: "This category has a balanced power dynamic with opportunities for negotiation leverage.",
  recommendedApproach: "Use a balanced negotiation approach, leveraging competition while building strategic relationships."
};

export async function generatePortersFiveForces(
  category: string,
  subcategoryL2?: string,
  subcategoryL3?: string
): Promise<any> {
  if (!apiKey) throw new Error("OpenAI API key is not configured");
  
  try {
    return await makeOpenAIRequest(
      async () => {
        let categoryDescription = category;
        if (subcategoryL2) categoryDescription += ` > ${subcategoryL2}`;
        if (subcategoryL3) categoryDescription += ` > ${subcategoryL3}`;
        
        const prompt = `Perform a Porter's Five Forces analysis for the procurement category "${categoryDescription}". Provide an analysis of supplier power, buyer power, threat of substitutes, threat of new entrants, and competitive rivalry.
        
For each force, include:
1. A power level (high, medium, or low)
2. A brief description of the force in this category
3. Key factors contributing to this assessment
4. Specific negotiation strategy recommendations based on this force

Also include an overall summary and recommended negotiation approach.

Format your response as a JSON object with the following structure:
{
  "supplierPower": {
    "level": "high|medium|low",
    "description": "...",
    "factors": ["factor1", "factor2", "factor3"],
    "negotiationStrategy": "..."
  },
  "buyerPower": { ... },
  "substituteThreat": { ... },
  "newEntrantThreat": { ... },
  "competitiveRivalry": { ... },
  "summary": "...",
  "recommendedApproach": "..."
}`;
        
        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: getSystemPrompt("market") },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        });
        
        return JSON.parse(completion.choices[0].message.content || "{}");
      },
      2 // Lower max attempts for this less critical function
    );
  } catch (error) {
    console.error("All attempts to generate Porter's Five Forces analysis failed:", error);
    return DEFAULT_FIVE_FORCES_ANALYSIS;
  }
}