
// Cart backup utility for handling cart persistence during authentication state changes
export const CartBackup = {
  // Save current cart to localStorage as backup
  saveCartBackup: (cart: any[]) => {
    try {
      localStorage.setItem('cart_backup', JSON.stringify(cart));
      console.log('[CART BACKUP] Saved cart backup:', cart.length, 'items');
    } catch (error) {
      console.error('[CART BACKUP] Error saving cart backup:', error);
    }
  },

  // Load cart backup from localStorage
  loadCartBackup: (): any[] => {
    try {
      const backup = localStorage.getItem('cart_backup');
      const parsedBackup = backup ? JSON.parse(backup) : [];
      console.log('[CART BACKUP] Loaded cart backup:', parsedBackup.length, 'items');
      return parsedBackup;
    } catch (error) {
      console.error('[CART BACKUP] Error loading cart backup:', error);
      return [];
    }
  },

  // Clear cart backup
  clearCartBackup: () => {
    try {
      localStorage.removeItem('cart_backup');
      console.log('[CART BACKUP] Cleared cart backup');
    } catch (error) {
      console.error('[CART BACKUP] Error clearing cart backup:', error);
    }
  },

  // Restore cart from backup to regular storage
  restoreFromBackup: () => {
    try {
      const backup = CartBackup.loadCartBackup();
      if (backup.length > 0) {
        localStorage.setItem('cart', JSON.stringify(backup));
        console.log('[CART BACKUP] Restored cart from backup:', backup.length, 'items');
      }
      CartBackup.clearCartBackup();
      return backup;
    } catch (error) {
      console.error('[CART BACKUP] Error restoring from backup:', error);
      return [];
    }
  }
};
