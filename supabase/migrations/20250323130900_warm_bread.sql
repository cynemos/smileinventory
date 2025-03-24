/*
  # Add inventory management triggers and constraints

  1. Changes
    - Add function to calculate total inventory quantity
    - Add trigger to update product status based on inventory
    - Add trigger to validate inventory movements
    - Add constraint for positive quantities

  2. Security
    - Maintain existing RLS policies
*/

-- Function to calculate total inventory quantity for a product
CREATE OR REPLACE FUNCTION calculate_total_inventory_quantity(p_product_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(quantity)
     FROM inventory_items
     WHERE product_id = p_product_id),
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
  total_quantity := calculate_total_inventory_quantity(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END
  );
  
  -- Update the product status based on the total quantity
  UPDATE products
  SET 
    status = CASE 
      WHEN total_quantity > 0 THEN 'ACTIVE'
      ELSE 'OUT_OF_STOCK'
    END
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.product_id
    ELSE NEW.product_id
  END;
  
  RETURN CASE
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
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

-- Add check constraint to ensure quantity is positive
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS check_quantity_positive;

ALTER TABLE inventory_items
ADD CONSTRAINT check_quantity_positive
CHECK (quantity >= 0);

-- Update existing inventory items to ensure positive quantities
UPDATE inventory_items
SET quantity = 0
WHERE quantity < 0;
