// Define the structure for category data
export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

// Main procurement categories with sub-categories
export const categoryHierarchy: Category[] = [
  {
    id: "it",
    name: "IT",
    children: [
      {
        id: "it-hardware",
        name: "Hardware",
        children: [
          { id: "it-hardware-laptops", name: "Laptops" },
          { id: "it-hardware-desktops", name: "Desktops" },
          { id: "it-hardware-servers", name: "Servers" },
          { id: "it-hardware-networking", name: "Networking Equipment" },
          { id: "it-hardware-peripherals", name: "Peripherals" },
        ]
      },
      {
        id: "it-software",
        name: "Software",
        children: [
          { id: "it-software-os", name: "Operating Systems" },
          { id: "it-software-security", name: "Security Software" },
          { id: "it-software-productivity", name: "Productivity Tools" },
          { id: "it-software-saas", name: "SaaS Subscriptions" },
          { id: "it-software-development", name: "Development Tools" },
        ]
      },
      {
        id: "it-services",
        name: "Services",
        children: [
          { id: "it-services-consulting", name: "Consulting" },
          { id: "it-services-managed", name: "Managed Services" },
          { id: "it-services-cloud", name: "Cloud Services" },
          { id: "it-services-support", name: "Support & Maintenance" },
          { id: "it-services-training", name: "Training" },
        ]
      },
      {
        id: "it-telecom",
        name: "Telecommunications",
        children: [
          { id: "it-telecom-mobile", name: "Mobile Services" },
          { id: "it-telecom-voip", name: "VoIP Services" },
          { id: "it-telecom-internet", name: "Internet Services" },
          { id: "it-telecom-equipment", name: "Telecom Equipment" },
        ]
      }
    ]
  },
  {
    id: "office",
    name: "Office Supplies",
    children: [
      {
        id: "office-stationery",
        name: "Stationery",
        children: [
          { id: "office-stationery-paper", name: "Paper Products" },
          { id: "office-stationery-writing", name: "Writing Instruments" },
          { id: "office-stationery-filing", name: "Filing & Organization" },
        ]
      },
      {
        id: "office-furniture",
        name: "Furniture",
        children: [
          { id: "office-furniture-desks", name: "Desks & Tables" },
          { id: "office-furniture-chairs", name: "Chairs & Seating" },
          { id: "office-furniture-storage", name: "Storage Solutions" },
          { id: "office-furniture-panels", name: "Partitions & Panels" },
        ]
      },
      {
        id: "office-equipment",
        name: "Equipment",
        children: [
          { id: "office-equipment-printing", name: "Printing Equipment" },
          { id: "office-equipment-binding", name: "Binding Equipment" },
          { id: "office-equipment-shredders", name: "Shredders" },
          { id: "office-equipment-projectors", name: "Projectors & Displays" },
        ]
      }
    ]
  },
  {
    id: "facilities",
    name: "Facilities & Maintenance",
    children: [
      {
        id: "facilities-cleaning",
        name: "Cleaning Services",
        children: [
          { id: "facilities-cleaning-janitorial", name: "Janitorial Services" },
          { id: "facilities-cleaning-supplies", name: "Cleaning Supplies" },
          { id: "facilities-cleaning-waste", name: "Waste Management" },
        ]
      },
      {
        id: "facilities-maintenance",
        name: "Maintenance",
        children: [
          { id: "facilities-maintenance-repair", name: "Repair Services" },
          { id: "facilities-maintenance-hvac", name: "HVAC" },
          { id: "facilities-maintenance-electrical", name: "Electrical" },
          { id: "facilities-maintenance-plumbing", name: "Plumbing" },
        ]
      },
      {
        id: "facilities-security",
        name: "Security",
        children: [
          { id: "facilities-security-systems", name: "Security Systems" },
          { id: "facilities-security-guards", name: "Security Guards" },
          { id: "facilities-security-access", name: "Access Control" },
        ]
      },
      {
        id: "facilities-utilities",
        name: "Utilities",
        children: [
          { id: "facilities-utilities-electricity", name: "Electricity" },
          { id: "facilities-utilities-water", name: "Water" },
          { id: "facilities-utilities-gas", name: "Gas" },
        ]
      }
    ]
  },
  {
    id: "professional",
    name: "Professional Services",
    children: [
      {
        id: "professional-consulting",
        name: "Consulting",
        children: [
          { id: "professional-consulting-strategy", name: "Strategy Consulting" },
          { id: "professional-consulting-management", name: "Management Consulting" },
          { id: "professional-consulting-financial", name: "Financial Consulting" },
        ]
      },
      {
        id: "professional-legal",
        name: "Legal Services",
        children: [
          { id: "professional-legal-corporate", name: "Corporate Law" },
          { id: "professional-legal-ip", name: "Intellectual Property" },
          { id: "professional-legal-employment", name: "Employment Law" },
          { id: "professional-legal-regulatory", name: "Regulatory Compliance" },
        ]
      },
      {
        id: "professional-financial",
        name: "Financial Services",
        children: [
          { id: "professional-financial-accounting", name: "Accounting Services" },
          { id: "professional-financial-audit", name: "Audit Services" },
          { id: "professional-financial-tax", name: "Tax Services" },
        ]
      },
      {
        id: "professional-hr",
        name: "HR Services",
        children: [
          { id: "professional-hr-recruitment", name: "Recruitment Services" },
          { id: "professional-hr-training", name: "Training & Development" },
          { id: "professional-hr-benefits", name: "Benefits Administration" },
        ]
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Advertising",
    children: [
      {
        id: "marketing-advertising",
        name: "Advertising",
        children: [
          { id: "marketing-advertising-digital", name: "Digital Advertising" },
          { id: "marketing-advertising-print", name: "Print Advertising" },
          { id: "marketing-advertising-tv", name: "TV & Radio Advertising" },
          { id: "marketing-advertising-outdoor", name: "Outdoor Advertising" },
        ]
      },
      {
        id: "marketing-media",
        name: "Media",
        children: [
          { id: "marketing-media-social", name: "Social Media" },
          { id: "marketing-media-content", name: "Content Marketing" },
          { id: "marketing-media-seo", name: "SEO & SEM" },
        ]
      },
      {
        id: "marketing-creative",
        name: "Creative Services",
        children: [
          { id: "marketing-creative-design", name: "Graphic Design" },
          { id: "marketing-creative-production", name: "Production Services" },
          { id: "marketing-creative-web", name: "Web Design & Development" },
        ]
      },
      {
        id: "marketing-events",
        name: "Events & Promotions",
        children: [
          { id: "marketing-events-conferences", name: "Conferences & Seminars" },
          { id: "marketing-events-trade", name: "Trade Shows" },
          { id: "marketing-events-corporate", name: "Corporate Events" },
        ]
      }
    ]
  },
  {
    id: "travel",
    name: "Travel & Entertainment",
    children: [
      {
        id: "travel-transportation",
        name: "Transportation",
        children: [
          { id: "travel-transportation-air", name: "Air Travel" },
          { id: "travel-transportation-rail", name: "Rail Travel" },
          { id: "travel-transportation-car", name: "Car Rental" },
        ]
      },
      {
        id: "travel-accommodation",
        name: "Accommodation",
        children: [
          { id: "travel-accommodation-hotels", name: "Hotels & Lodging" },
          { id: "travel-accommodation-corporate", name: "Corporate Housing" },
        ]
      },
      {
        id: "travel-meals",
        name: "Meals & Entertainment",
        children: [
          { id: "travel-meals-dining", name: "Business Dining" },
          { id: "travel-meals-catering", name: "Catering Services" },
          { id: "travel-meals-entertainment", name: "Entertainment" },
        ]
      }
    ]
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Production",
    children: [
      {
        id: "manufacturing-materials",
        name: "Raw Materials",
        children: [
          { id: "manufacturing-materials-metals", name: "Metals" },
          { id: "manufacturing-materials-plastics", name: "Plastics" },
          { id: "manufacturing-materials-chemicals", name: "Chemicals" },
          { id: "manufacturing-materials-textiles", name: "Textiles" },
        ]
      },
      {
        id: "manufacturing-components",
        name: "Components & Parts",
        children: [
          { id: "manufacturing-components-electrical", name: "Electrical Components" },
          { id: "manufacturing-components-mechanical", name: "Mechanical Components" },
          { id: "manufacturing-components-electronic", name: "Electronic Components" },
        ]
      },
      {
        id: "manufacturing-equipment",
        name: "Manufacturing Equipment",
        children: [
          { id: "manufacturing-equipment-machinery", name: "Machinery" },
          { id: "manufacturing-equipment-tools", name: "Tools & Dies" },
          { id: "manufacturing-equipment-automation", name: "Automation Equipment" },
        ]
      },
      {
        id: "manufacturing-packaging",
        name: "Packaging",
        children: [
          { id: "manufacturing-packaging-materials", name: "Packaging Materials" },
          { id: "manufacturing-packaging-equipment", name: "Packaging Equipment" },
          { id: "manufacturing-packaging-services", name: "Packaging Services" },
        ]
      }
    ]
  },
  {
    id: "logistics",
    name: "Logistics & Transportation",
    children: [
      {
        id: "logistics-freight",
        name: "Freight Services",
        children: [
          { id: "logistics-freight-air", name: "Air Freight" },
          { id: "logistics-freight-sea", name: "Sea Freight" },
          { id: "logistics-freight-road", name: "Road Freight" },
          { id: "logistics-freight-rail", name: "Rail Freight" },
        ]
      },
      {
        id: "logistics-warehousing",
        name: "Warehousing",
        children: [
          { id: "logistics-warehousing-storage", name: "Storage Services" },
          { id: "logistics-warehousing-fulfillment", name: "Fulfillment Services" },
          { id: "logistics-warehousing-equipment", name: "Warehouse Equipment" },
        ]
      },
      {
        id: "logistics-customs",
        name: "Customs & Compliance",
        children: [
          { id: "logistics-customs-brokerage", name: "Customs Brokerage" },
          { id: "logistics-customs-consulting", name: "Trade Compliance Consulting" },
        ]
      },
      {
        id: "logistics-fleet",
        name: "Fleet Management",
        children: [
          { id: "logistics-fleet-vehicles", name: "Fleet Vehicles" },
          { id: "logistics-fleet-maintenance", name: "Fleet Maintenance" },
          { id: "logistics-fleet-telematics", name: "Fleet Telematics" },
        ]
      }
    ]
  },
  {
    id: "other",
    name: "Other Categories",
    children: [
      {
        id: "other-insurance",
        name: "Insurance",
        children: [
          { id: "other-insurance-general", name: "General Insurance" },
          { id: "other-insurance-liability", name: "Liability Insurance" },
          { id: "other-insurance-property", name: "Property Insurance" },
        ]
      },
      {
        id: "other-taxes",
        name: "Taxes & Fees",
        children: [
          { id: "other-taxes-government", name: "Government Taxes" },
          { id: "other-taxes-regulatory", name: "Regulatory Fees" },
          { id: "other-taxes-licenses", name: "Licenses & Permits" },
        ]
      },
      {
        id: "other-misc",
        name: "Miscellaneous",
        children: [
          { id: "other-misc-subscriptions", name: "Subscriptions" },
          { id: "other-misc-memberships", name: "Memberships" },
          { id: "other-misc-donations", name: "Donations & Sponsorships" },
        ]
      }
    ]
  }
];

// Helper function to find a category by its ID
export function findCategoryById(id: string, categories: Category[] = categoryHierarchy): Category | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findCategoryById(id, category.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// Helper function to get the full path of a category (level1/level2/level3)
export function getCategoryPath(categoryId: string): { level1: string, level2?: string, level3?: string } | null {
  // Find the category by ID
  const parts = categoryId.split('-');
  
  if (parts.length === 1) {
    // Level 1 category
    const category = categoryHierarchy.find(c => c.id === categoryId);
    return category ? { level1: category.name } : null;
  } else if (parts.length === 2) {
    // Level 2 category
    const level1Id = parts[0];
    const level1 = categoryHierarchy.find(c => c.id === level1Id);
    if (!level1 || !level1.children) return null;
    
    const level2 = level1.children.find(c => c.id === categoryId);
    return level2 ? { level1: level1.name, level2: level2.name } : null;
  } else if (parts.length === 3) {
    // Level 3 category
    const level1Id = parts[0];
    const level2Id = `${parts[0]}-${parts[1]}`;
    
    const level1 = categoryHierarchy.find(c => c.id === level1Id);
    if (!level1 || !level1.children) return null;
    
    const level2 = level1.children.find(c => c.id === level2Id);
    if (!level2 || !level2.children) return null;
    
    const level3 = level2.children.find(c => c.id === categoryId);
    return level3 ? { level1: level1.name, level2: level2.name, level3: level3.name } : null;
  }
  
  return null;
}

// Get flat list of all categories for autocomplete
export function getAllCategories(): { id: string, name: string, level: number }[] {
  const result: { id: string, name: string, level: number }[] = [];
  
  function traverse(categories: Category[], level: number) {
    for (const category of categories) {
      result.push({ id: category.id, name: category.name, level });
      if (category.children) {
        traverse(category.children, level + 1);
      }
    }
  }
  
  traverse(categoryHierarchy, 1);
  return result;
}