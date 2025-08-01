interface ServicePricing {
  minPrice: number;
  maxPrice: number;
  defaultPrice: number;
}

interface ServicePricingData {
  [key: string]: ServicePricing;
}

// Service-specific pricing data based on categories and average project prices
export const servicePricingData: ServicePricingData = {
  // Design Category
  "UX/UI Design": { minPrice: 60000, maxPrice: 120000, defaultPrice: 90000 },
  "UI/UX Design": { minPrice: 60000, maxPrice: 120000, defaultPrice: 90000 },
  
  // Infrastructure Category
  "Cloud Computing Services": { minPrice: 120000, maxPrice: 250000, defaultPrice: 185000 },
  "Cloud Infrastructure": { minPrice: 120000, maxPrice: 250000, defaultPrice: 185000 },
  
  // AI & ML Category
  "Artificial Intelligence Development": { minPrice: 200000, maxPrice: 600000, defaultPrice: 400000 },
  "AI Development": { minPrice: 200000, maxPrice: 600000, defaultPrice: 400000 },
  "Chatbot Development": { minPrice: 40000, maxPrice: 100000, defaultPrice: 70000 },
  
  // Development Category
  "Web Full-stack Development": { minPrice: 80000, maxPrice: 200000, defaultPrice: 140000 },
  "Web Development": { minPrice: 80000, maxPrice: 200000, defaultPrice: 140000 },
  "Full-stack Development": { minPrice: 80000, maxPrice: 200000, defaultPrice: 140000 },
  "Mobile App Development": { minPrice: 150000, maxPrice: 400000, defaultPrice: 275000 },
  
  // Immersive Tech Category
  "VR/AR Development": { minPrice: 250000, maxPrice: 500000, defaultPrice: 375000 },
  "Virtual Reality Development": { minPrice: 250000, maxPrice: 500000, defaultPrice: 375000 },
  "Augmented Reality Development": { minPrice: 250000, maxPrice: 500000, defaultPrice: 375000 },
  
  // Blockchain Category
  "Blockchain Development": { minPrice: 200000, maxPrice: 400000, defaultPrice: 300000 },
  
  // Analytics Category
  "Data Analytics & Business Intelligence": { minPrice: 100000, maxPrice: 250000, defaultPrice: 175000 },
  "Data Analytics": { minPrice: 100000, maxPrice: 250000, defaultPrice: 175000 },
  "Business Intelligence": { minPrice: 100000, maxPrice: 250000, defaultPrice: 175000 },
  
  // Gaming Category
  "Game Development": { minPrice: 200000, maxPrice: 500000, defaultPrice: 350000 },
  
  // IoT Category
  "IoT Development": { minPrice: 120000, maxPrice: 300000, defaultPrice: 210000 },
  
  // SaaS Products Category
  "VirtuTeams Affiliate": { minPrice: 25000, maxPrice: 50000, defaultPrice: 37500 },
  "Speaksify Affiliate": { minPrice: 25000, maxPrice: 100000, defaultPrice: 62500 },
  "Projectsy.ai Affiliate": { minPrice: 49999, maxPrice: 49999, defaultPrice: 49999 }, // Monthly subscription
  "ChromeBot.ai Affiliate": { minPrice: 30000, maxPrice: 80000, defaultPrice: 55000 },
};

// Default pricing for services not in the list
const defaultPricing: ServicePricing = { minPrice: 50000, maxPrice: 150000, defaultPrice: 100000 };

export const getServicePricing = (serviceName: string): ServicePricing => {
  return servicePricingData[serviceName] || defaultPricing;
};

export const formatPriceRange = (pricing: ServicePricing): string => {
  if (pricing.minPrice === pricing.maxPrice) {
    return `₹${pricing.minPrice.toLocaleString()}`;
  }
  return `₹${pricing.minPrice.toLocaleString()} – ₹${pricing.maxPrice.toLocaleString()}`;
};

export const calculateProfitShare = (projectPrice: number, profitPercentage: number = 70): number => {
  return (projectPrice * profitPercentage) / 100;
};