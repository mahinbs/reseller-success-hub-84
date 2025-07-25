-- Update cart_items constraints to allow addon items

-- Drop the existing item_type constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_item_type_check;

-- Add new constraint that includes addon
ALTER TABLE cart_items ADD CONSTRAINT cart_items_item_type_check 
CHECK (item_type = ANY (ARRAY['service'::text, 'bundle'::text, 'addon'::text]));

-- Update the service_or_bundle constraint to handle addons properly
-- Addons use service_id column, so the constraint should allow service_id for both services and addons
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_service_or_bundle_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_service_or_bundle_check 
CHECK (
  ((service_id IS NOT NULL) AND (bundle_id IS NULL)) OR 
  ((service_id IS NULL) AND (bundle_id IS NOT NULL))
);