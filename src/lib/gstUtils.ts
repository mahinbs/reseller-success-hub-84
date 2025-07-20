
/**
 * GST utility functions for price calculations and formatting
 * GST rate is 18% as per Indian tax regulations
 */

const GST_RATE = 0.18; // 18% GST

/**
 * Calculate GST amount for a given base price
 */
export const calculateGST = (amount: number): number => {
  return Math.round((amount * GST_RATE) * 100) / 100;
};

/**
 * Get total price including GST
 */
export const getPriceWithGST = (amount: number): number => {
  return Math.round((amount * (1 + GST_RATE)) * 100) / 100;
};

/**
 * Format price display with GST information
 */
export const formatPriceWithGST = (amount: number): { basePrice: number; gstAmount: number; totalPrice: number } => {
  const gstAmount = calculateGST(amount);
  const totalPrice = getPriceWithGST(amount);
  
  return {
    basePrice: amount,
    gstAmount,
    totalPrice
  };
};

/**
 * Get GST display text component props
 */
export const getGSTDisplayProps = () => ({
  className: "text-xs text-muted-foreground mt-1",
  text: "+ 18% GST applicable"
});
