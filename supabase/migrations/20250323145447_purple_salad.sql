/*
  # Fix RLS policies for products table

  1. Changes
    - Drop existing restrictive policies
    - Create new policy allowing authenticated users full access
    - Ensure RLS is enabled
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins have full access to products" ON products;
DROP POLICY IF EXISTS "Staff can view products" ON products;

-- Create a simple policy for authenticated access
CREATE POLICY "Authenticated users can access products"
  ON products FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
