-- Add addon_id column to purchase_items table
ALTER TABLE purchase_items ADD COLUMN addon_id UUID;

-- Add foreign key constraint for addon_id
ALTER TABLE purchase_items ADD CONSTRAINT purchase_items_addon_id_fkey 
FOREIGN KEY (addon_id) REFERENCES addons(id);

-- Update the check constraint to handle all three types (service, bundle, addon)
ALTER TABLE purchase_items DROP CONSTRAINT IF EXISTS purchase_item_type_check;
ALTER TABLE purchase_items ADD CONSTRAINT purchase_item_type_check 
CHECK (
  (service_id IS NOT NULL AND bundle_id IS NULL AND addon_id IS NULL) OR 
  (service_id IS NULL AND bundle_id IS NOT NULL AND addon_id IS NULL) OR
  (service_id IS NULL AND bundle_id IS NULL AND addon_id IS NOT NULL)
);