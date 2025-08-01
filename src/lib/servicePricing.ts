interface ServicePricing {
  minPrice: number;
  maxPrice: number;
  defaultPrice: number;
}

interface ServicePricingData {
  [key: string]: ServicePricing;
}

// Service-specific pricing data based on revised market rates
export const servicePricingData: ServicePricingData = {
  // Design Category
  "UX/UI Design": { minPrice: 40000, maxPrice: 70000, defaultPrice: 55000 },
  "UI/UX Design": { minPrice: 40000, maxPrice: 70000, defaultPrice: 55000 },
  
  // Infrastructure Category
  "Cloud Computing Services": { minPrice: 80000, maxPrice: 150000, defaultPrice: 115000 },
  "Cloud Infrastructure": { minPrice: 80000, maxPrice: 150000, defaultPrice: 115000 },
  
  // AI & ML Category
  "Artificial Intelligence Development": { minPrice: 120000, maxPrice: 300000, defaultPrice: 210000 },
  "AI Development": { minPrice: 120000, maxPrice: 300000, defaultPrice: 210000 },
  "Chatbot Development": { minPrice: 25000, maxPrice: 70000, defaultPrice: 47500 },
  
  // Development Category
  "Web Full-stack Development": { minPrice: 60000, maxPrice: 120000, defaultPrice: 90000 },
  "Web Development": { minPrice: 60000, maxPrice: 120000, defaultPrice: 90000 },
  "Full-stack Development": { minPrice: 60000, maxPrice: 120000, defaultPrice: 90000 },
  "Mobile App Development": { minPrice: 100000, maxPrice: 250000, defaultPrice: 175000 },
  
  // Immersive Tech Category
  "VR/AR Development": { minPrice: 150000, maxPrice: 300000, defaultPrice: 225000 },
  "Virtual Reality Development": { minPrice: 150000, maxPrice: 300000, defaultPrice: 225000 },
  "Augmented Reality Development": { minPrice: 150000, maxPrice: 300000, defaultPrice: 225000 },
  
  // Blockchain Category
  "Blockchain Development": { minPrice: 150000, maxPrice: 300000, defaultPrice: 225000 },
  
  // Analytics Category
  "Data Analytics & Business Intelligence": { minPrice: 60000, maxPrice: 150000, defaultPrice: 105000 },
  "Data Analytics": { minPrice: 60000, maxPrice: 150000, defaultPrice: 105000 },
  "Business Intelligence": { minPrice: 60000, maxPrice: 150000, defaultPrice: 105000 },
  
  // Gaming Category
  "Game Development": { minPrice: 150000, maxPrice: 300000, defaultPrice: 225000 },
  
  // IoT Category
  "IoT Development": { minPrice: 80000, maxPrice: 200000, defaultPrice: 140000 },
  
  // SaaS Products Category
  "VirtuTeams Affiliate": { minPrice: 20000, maxPrice: 50000, defaultPrice: 35000 },
  "Speaksify Affiliate": { minPrice: 20000, maxPrice: 70000, defaultPrice: 45000 },
  "Projectsy.ai Affiliate": { minPrice: 49999, maxPrice: 49999, defaultPrice: 49999 }, // Monthly subscription
  "ChromeBot.ai Affiliate": { minPrice: 30000, maxPrice: 60000, defaultPrice: 45000 },
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