import OpenAI from "openai";
import { getCategoryPath } from "./category-utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Auto-categorize a purchase description into a 3-level category hierarchy
 * @param description The purchase description to categorize
 * @returns An object containing the 3 levels of categorization
 */
export async function autoCategorize(description: string): Promise<{
  categoryId: string;
  level1: string;
  level2?: string;
  level3?: string;
  confidence: number;
}> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in the environment variables");
    }

    const systemPrompt = `
      You are an expert in procurement categorization. Your task is to analyze a purchase description 
      and categorize it into a specific category ID from the following hierarchical procurement taxonomy:
      
      * it: IT
        * it-hardware: Hardware
          * it-hardware-laptops: Laptops
          * it-hardware-desktops: Desktops
          * it-hardware-servers: Servers
          * it-hardware-networking: Networking Equipment
          * it-hardware-peripherals: Peripherals
        * it-software: Software
          * it-software-os: Operating Systems
          * it-software-security: Security Software
          * it-software-productivity: Productivity Tools
          * it-software-saas: SaaS Subscriptions
          * it-software-development: Development Tools
        * it-services: Services
          * it-services-consulting: Consulting
          * it-services-managed: Managed Services
          * it-services-cloud: Cloud Services
          * it-services-support: Support & Maintenance
          * it-services-training: Training
        * it-telecom: Telecommunications
          * it-telecom-mobile: Mobile Services
          * it-telecom-voip: VoIP Services
          * it-telecom-internet: Internet Services
          * it-telecom-equipment: Telecom Equipment
      * office: Office Supplies
        * office-stationery: Stationery
          * office-stationery-paper: Paper Products
          * office-stationery-writing: Writing Instruments
          * office-stationery-filing: Filing & Organization
        * office-furniture: Furniture
          * office-furniture-desks: Desks & Tables
          * office-furniture-chairs: Chairs & Seating
          * office-furniture-storage: Storage Solutions
          * office-furniture-panels: Partitions & Panels
        * office-equipment: Equipment
          * office-equipment-printing: Printing Equipment
          * office-equipment-binding: Binding Equipment
          * office-equipment-shredders: Shredders
          * office-equipment-projectors: Projectors & Displays
      * facilities: Facilities & Maintenance
        * facilities-cleaning: Cleaning Services
          * facilities-cleaning-janitorial: Janitorial Services
          * facilities-cleaning-supplies: Cleaning Supplies
          * facilities-cleaning-waste: Waste Management
        * facilities-maintenance: Maintenance
          * facilities-maintenance-repair: Repair Services
          * facilities-maintenance-hvac: HVAC
          * facilities-maintenance-electrical: Electrical
          * facilities-maintenance-plumbing: Plumbing
        * facilities-security: Security
          * facilities-security-systems: Security Systems
          * facilities-security-guards: Security Guards
          * facilities-security-access: Access Control
        * facilities-utilities: Utilities
          * facilities-utilities-electricity: Electricity
          * facilities-utilities-water: Water
          * facilities-utilities-gas: Gas
      * professional: Professional Services
        * professional-consulting: Consulting
          * professional-consulting-strategy: Strategy Consulting
          * professional-consulting-management: Management Consulting
          * professional-consulting-financial: Financial Consulting
        * professional-legal: Legal Services
          * professional-legal-corporate: Corporate Law
          * professional-legal-ip: Intellectual Property
          * professional-legal-employment: Employment Law
          * professional-legal-regulatory: Regulatory Compliance
        * professional-financial: Financial Services
          * professional-financial-accounting: Accounting Services
          * professional-financial-audit: Audit Services
          * professional-financial-tax: Tax Services
        * professional-hr: HR Services
          * professional-hr-recruitment: Recruitment Services
          * professional-hr-training: Training & Development
          * professional-hr-benefits: Benefits Administration
      * marketing: Marketing & Advertising
        * marketing-advertising: Advertising
          * marketing-advertising-digital: Digital Advertising
          * marketing-advertising-print: Print Advertising
          * marketing-advertising-tv: TV & Radio Advertising
          * marketing-advertising-outdoor: Outdoor Advertising
        * marketing-media: Media
          * marketing-media-social: Social Media
          * marketing-media-content: Content Marketing
          * marketing-media-seo: SEO & SEM
        * marketing-creative: Creative Services
          * marketing-creative-design: Graphic Design
          * marketing-creative-production: Production Services
          * marketing-creative-web: Web Design & Development
        * marketing-events: Events & Promotions
          * marketing-events-conferences: Conferences & Seminars
          * marketing-events-trade: Trade Shows
          * marketing-events-corporate: Corporate Events
      * travel: Travel & Entertainment
        * travel-transportation: Transportation
          * travel-transportation-air: Air Travel
          * travel-transportation-rail: Rail Travel
          * travel-transportation-car: Car Rental
        * travel-accommodation: Accommodation
          * travel-accommodation-hotels: Hotels & Lodging
          * travel-accommodation-corporate: Corporate Housing
        * travel-meals: Meals & Entertainment
          * travel-meals-dining: Business Dining
          * travel-meals-catering: Catering Services
          * travel-meals-entertainment: Entertainment
      * manufacturing: Manufacturing & Production
        * manufacturing-materials: Raw Materials
          * manufacturing-materials-metals: Metals
          * manufacturing-materials-plastics: Plastics
          * manufacturing-materials-chemicals: Chemicals
          * manufacturing-materials-textiles: Textiles
        * manufacturing-components: Components & Parts
          * manufacturing-components-electrical: Electrical Components
          * manufacturing-components-mechanical: Mechanical Components
          * manufacturing-components-electronic: Electronic Components
        * manufacturing-equipment: Manufacturing Equipment
          * manufacturing-equipment-machinery: Machinery
          * manufacturing-equipment-tools: Tools & Dies
          * manufacturing-equipment-automation: Automation Equipment
        * manufacturing-packaging: Packaging
          * manufacturing-packaging-materials: Packaging Materials
          * manufacturing-packaging-equipment: Packaging Equipment
          * manufacturing-packaging-services: Packaging Services
      * logistics: Logistics & Transportation
        * logistics-freight: Freight Services
          * logistics-freight-air: Air Freight
          * logistics-freight-sea: Sea Freight
          * logistics-freight-road: Road Freight
          * logistics-freight-rail: Rail Freight
        * logistics-warehousing: Warehousing
          * logistics-warehousing-storage: Storage Services
          * logistics-warehousing-fulfillment: Fulfillment Services
          * logistics-warehousing-equipment: Warehouse Equipment
        * logistics-customs: Customs & Compliance
          * logistics-customs-brokerage: Customs Brokerage
          * logistics-customs-consulting: Trade Compliance Consulting
        * logistics-fleet: Fleet Management
          * logistics-fleet-vehicles: Fleet Vehicles
          * logistics-fleet-maintenance: Fleet Maintenance
          * logistics-fleet-telematics: Fleet Telematics
      * other: Other Categories
        * other-insurance: Insurance
          * other-insurance-general: General Insurance
          * other-insurance-liability: Liability Insurance
          * other-insurance-property: Property Insurance
        * other-taxes: Taxes & Fees
          * other-taxes-government: Government Taxes
          * other-taxes-regulatory: Regulatory Fees
          * other-taxes-licenses: Licenses & Permits
        * other-misc: Miscellaneous
          * other-misc-subscriptions: Subscriptions
          * other-misc-memberships: Memberships
          * other-misc-donations: Donations & Sponsorships
      
      Return ONLY the most specific (level 3 if possible) category ID that matches the purchase description. 
      Also provide a confidence score between 0 and 1 indicating how confident you are in the categorization.
      
      Return your response as JSON in the following format:
      {
        "categoryId": "category-id",  // The most specific category ID that matches
        "confidence": 0.95  // A number between 0 and 1
      }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Purchase description: "${description}"` }
      ],
      response_format: { type: "json_object" },
    });

    // Ensure we have a valid content string before parsing
    const contentStr = response.choices[0].message.content || '{"categoryId": "other-misc-subscriptions", "confidence": 0.1}';
    const result = JSON.parse(contentStr);
    
    // Get the category path based on the ID
    const categoryPath = getCategoryPath(result.categoryId);
    
    if (!categoryPath) {
      throw new Error(`Invalid category ID returned: ${result.categoryId}`);
    }
    
    return {
      categoryId: result.categoryId,
      level1: categoryPath.level1,
      level2: categoryPath.level2 || undefined,
      level3: categoryPath.level3 || undefined,
      confidence: Math.min(1, Math.max(0, result.confidence)),
    };
  } catch (error) {
    console.error("Auto-categorization failed:", error);
    // Return a default category with low confidence if we can't categorize
    return {
      categoryId: "other-misc-subscriptions",
      level1: "Other Categories",
      level2: "Miscellaneous",
      level3: "Subscriptions",
      confidence: 0.1,
    };
  }
}