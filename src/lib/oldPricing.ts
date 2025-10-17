/**
 * Original pricing data before the price hike
 * Used when 'old_prices' coupon type is applied
 */

interface OldServicePricing {
  [serviceName: string]: number;
}

// Original prices before the hike
export const oldServicePrices: OldServicePricing = {
  // Design Category
  "UX/UI Design": 33333,
  "UI/UX Design": 33333,
  
  // Infrastructure Category  
  "Cloud Computing Services": 87000,
  "Cloud Infrastructure": 87000,
  
  // AI & ML Category
  "Artificial Intelligence Development": 125354,
  "AI Development": 125354,
  "Chatbot Development": 10128,
  
  // Development Category
  "Web Full-stack Development": 36105,
  "Web Development": 36105,
  "Full-stack Development": 36105,
  "Mobile App Development": 69608,
  
  // Immersive Tech Category
  "VR/AR Development": 95000,
  "Virtual Reality Development": 95000,
  "Augmented Reality Development": 95000,
  
  // Blockchain Category
  "Blockchain Development": 92000,
  
  // Analytics Category
  "Data Analytics & Business Intelligence": 20072,
  "Data Analytics": 20072,
  "Business Intelligence": 20072,
  
  // Gaming Category
  "Game Development": 99999,
  
  // IoT Category
  "IoT Development": 53391.65,
  
  // SaaS Products Category (Affiliate services)
  "VirtuTeams Affiliate": 19999.99,
  "Speaksify Affiliate": 19999.99,
  "Projectsy.ai Affiliate": 19999.99,
  "ChromeBot.ai Affiliate": 19999.99
};

/**
 * Get the old price for a service
 * @param serviceName - The name of the service
 * @returns The old price or null if not found
 */
export const getOldServicePrice = (serviceName: string): number | null => {
  return oldServicePrices[serviceName] || null;
};

/**
 * Check if a service has old pricing data
 * @param serviceName - The name of the service
 * @returns true if old pricing exists, false otherwise
 */
export const hasOldPricing = (serviceName: string): boolean => {
  return serviceName in oldServicePrices;
};

// Original bundle prices before the hike
export const oldBundlePrices: { [bundleName: string]: number } = {
  "AI Development Bundle": 77777,
  "Full-Stack Web Bundle": 138640.2,
  "Mobile & IoT Bundle": 92249.74,
  "SaaS Starter Bundle": 82507.47,
  "Super combo": 90355.98
};

/**
 * Get the old price for a bundle
 * @param bundleName - The name of the bundle
 * @returns The old bundle price or null if not found
 */
export const getOldBundlePrice = (bundleName: string): number | null => {
  return oldBundlePrices[bundleName] || null;
};

/**
 * Check if a bundle has old pricing data
 * @param bundleName - The name of the bundle
 * @returns true if old bundle pricing exists, false otherwise
 */
export const hasOldBundlePricing = (bundleName: string): boolean => {
  return bundleName in oldBundlePrices;
};

/**
 * Calculate the discount percentage from new to old price
 * @param oldPrice - The original price
 * @param newPrice - The current price
 * @returns The discount percentage
 */
export const calculateOldPriceDiscount = (oldPrice: number, newPrice: number): number => {
  if (newPrice === 0) return 0;
  return Math.round(((newPrice - oldPrice) / newPrice) * 100);
};
