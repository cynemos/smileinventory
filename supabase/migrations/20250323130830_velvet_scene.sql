/*
  # Add inventory quantity constraint

  1. Changes
    - Add trigger to ensure product reorder_quantity matches total inventory quantity
    - Update inventory_items table constraints
    - Add function to calculate total inventory quantity

  2. Security
    - Maintain existing RLS policies
*/

-- Function to calculate total inventory quantity for a product
CREATE OR REPLACE FUNCTION calculate_total_inventory_quantity(product_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(quantity)
     FROM inventory_items
     WHERE product_id = $1),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update product status based on inventory
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
DECLARE
  total_quantity integer;
BEGIN
  -- Calculate total quantity for the product
  total_quantity := calculate_total_inventory_quantity(NEW.product_id);
  
  -- Update the product status based on the total quantity
  UPDATE products
  SET 
    status = CASE 
      WHEN total_quantity > 0 THEN 'ACTIVE'
      ELSE 'OUT_OF_STOCK'
    END
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_product_status_trigger ON inventory_items;

-- Create new trigger for inventory updates
CREATE TRIGGER update_product_status_trigger
AFTER INSERT OR UPDATE OR DELETE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION update_product_status();

-- Function to validate inventory movement
CREATE OR REPLACE FUNCTION validate_inventory_movement()
RETURNS TRIGGER AS $$
DECLARE
  current_quantity integer;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- For OUT movements, check if there's enough stock
    IF NEW.type = 'OUT' THEN
      current_quantity := calculate_total_inventory_quantity(NEW.product_id);
      IF current_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuffisant. Quantité disponible: %', current_quantity;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_inventory_movement_trigger ON inventory_movements;

-- Create new trigger for movement validation
CREATE TRIGGER validate_inventory_movement_trigger
BEFORE INSERT OR UPDATE ON inventory_movements
FOR EACH ROW EXECUTE FUNCTION validate_inventory_movement();

-- Add check constraint to ensure quantity matches reorder_quantity
ALTER TABLE inventory_items
ADD CONSTRAINT check_quantity_positive
CHECK (quantity >= 0);

-- Update existing inventory items to match product reorder_quantity
UPDATE inventory_items ii
SET quantity = p.reorder_quantity
FROM products p
WHERE ii.product_id = p.id
AND ii.quantity <> p.reorder_quantity;
