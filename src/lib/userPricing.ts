/**
 * User-specific pricing utilities
 * Handles special pricing rules for specific users
 */

import { supabase } from '../integrations/supabase/client';

/**
 * Check if a user should see actual prices without discounts
 * @param userEmail - The user's email address
 * @returns Promise<boolean> - true if user should see actual prices, false otherwise
 */
export async function shouldShowActualPrices(userEmail: string | undefined): Promise<boolean> {
  if (!userEmail) {
    console.log('No user email provided');
    return false;
  }
  
  // Temporary hardcoded test for known no-discount users
  const noDiscountEmails = ['mandapati.anilkumar94@gmail.com'];
  if (noDiscountEmails.includes(userEmail.toLowerCase())) {
    console.log('🔧 HARDCODED: User is in no-discount list:', userEmail);
    return true;
  }
  
  try {
    console.log('🔍 Checking no-discount status for:', userEmail);
    const { data, error } = await supabase
      .from('no_discount_users' as any)
      .select('user_email')
      .eq('user_email', userEmail.toLowerCase());

    console.log('📊 No-discount check result:', { data, error, userEmail });
    console.log('📊 Data length:', data?.length);
    console.log('📊 Data content:', data);
    
    // Check if any records were found
    const isNoDiscountUser = !error && data && data.length > 0;
    console.log('✅ Is no-discount user:', isNoDiscountUser);
    
    return isNoDiscountUser;
  } catch (error) {
    console.error('❌ Error checking no-discount user status:', error);
    return false;
  }
}

/**
 * Check if a user can apply coupons
 * @param userEmail - The user's email address
 * @returns Promise<boolean> - true if user can apply coupons, false otherwise
 */
export async function canApplyCoupons(userEmail: string | undefined): Promise<boolean> {
  const showActualPrices = await shouldShowActualPrices(userEmail);
  return !showActualPrices;
}

/**
 * Check if a user should see discount information
 * @param userEmail - The user's email address
 * @returns Promise<boolean> - true if user should see discounts, false otherwise
 */
export async function shouldShowDiscounts(userEmail: string | undefined): Promise<boolean> {
  const showActualPrices = await shouldShowActualPrices(userEmail);
  return !showActualPrices;
}

/**
 * Check if a user should have a 20% price hike applied
 * @param userEmail - The user's email address
 * @returns boolean - true if user should have 20% price hike, false otherwise
 */
export function shouldApplyPriceHike(userEmail: string | undefined): boolean {
  if (!userEmail) {
    return false;
  }
  
  // Special pricing for users with 20% price hike
  const priceHikeEmails = ['ronaklalwani112@gmail.com', 'mahinventeskraft@gmail.com'];
  return priceHikeEmails.includes(userEmail.toLowerCase());
}

/**
 * Apply 20% price hike to a price
 * @param price - The original price
 * @param userEmail - The user's email address
 * @returns number - The hiked price if applicable, original price otherwise
 */
export function applyPriceHike(price: number, userEmail: string | undefined): number {
  if (shouldApplyPriceHike(userEmail)) {
    const hikedPrice = price * 1.20; // 20% increase
    return Math.round(hikedPrice);
  }
  return price;
}
