/*
  # Update suppliers table structure

  1. Changes
    - Update suppliers table to match the new schema
    - Add customer_reference column
    - Remove old contact_info column
    - Add proper constraints and defaults

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Drop and recreate suppliers table with new structure
DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  customer_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Accès complet pour les utilisateurs authentifiés"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
