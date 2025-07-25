-- Add addon_id column to cart_items table
ALTER TABLE cart_items ADD COLUMN addon_id UUID;

-- Add foreign key constraint for addon_id
ALTER TABLE cart_items ADD CONSTRAINT cart_items_addon_id_fkey 
FOREIGN KEY (addon_id) REFERENCES addons(id);

-- Update the service_or_bundle_check constraint to handle all three types
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_service_or_bundle_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_service_bundle_addon_check 
CHECK (
  (service_id IS NOT NULL AND bundle_id IS NULL AND addon_id IS NULL) OR 
  (service_id IS NULL AND bundle_id IS NOT NULL AND addon_id IS NULL) OR
  (service_id IS NULL AND bundle_id IS NULL AND addon_id IS NOT NULL)
);