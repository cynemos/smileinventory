/*
  # Fix Row Level Security Policies

  1. Changes
    - Remove existing "full access" policies
    - Add role-based policies for each table
    - Add user role check functions
    - Add proper security constraints

  2. Security Roles
    - ADMIN: Full access to all tables
    - PRACTITIONER: Full access to patients and treatments, read-only for inventory
    - ASSISTANT: Limited access based on specific needs
*/

-- Create function to check user roles
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON patients;
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON suppliers;
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON products;
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON inventory_items;
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON inventory_movements;
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON treatments;
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON treatment_products;

-- Patients table policies
CREATE POLICY "Admins have full access to patients"
  ON patients FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Practitioners can manage patients"
  ON patients FOR ALL TO authenticated
  USING (auth.user_has_role('PRACTITIONER'))
  WITH CHECK (auth.user_has_role('PRACTITIONER'));

CREATE POLICY "Assistants can view and update patients"
  ON patients FOR SELECT TO authenticated
  USING (auth.user_has_role('ASSISTANT'));

CREATE POLICY "Assistants can update patient info"
  ON patients FOR UPDATE TO authenticated
  USING (auth.user_has_role('ASSISTANT'))
  WITH CHECK (auth.user_has_role('ASSISTANT'));

-- Suppliers table policies
CREATE POLICY "Only admins can manage suppliers"
  ON suppliers FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Staff can view suppliers"
  ON suppliers FOR SELECT TO authenticated
  USING (auth.user_has_role('PRACTITIONER') OR auth.user_has_role('ASSISTANT'));

-- Products table policies
CREATE POLICY "Admins have full access to products"
  ON products FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Staff can view products"
  ON products FOR SELECT TO authenticated
  USING (auth.user_has_role('PRACTITIONER') OR auth.user_has_role('ASSISTANT'));

-- Inventory items policies
CREATE POLICY "Admins have full access to inventory"
  ON inventory_items FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Staff can view inventory"
  ON inventory_items FOR SELECT TO authenticated
  USING (auth.user_has_role('PRACTITIONER') OR auth.user_has_role('ASSISTANT'));

-- Inventory movements policies
CREATE POLICY "Admins have full access to movements"
  ON inventory_movements FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Staff can view movements"
  ON inventory_movements FOR SELECT TO authenticated
  USING (auth.user_has_role('PRACTITIONER') OR auth.user_has_role('ASSISTANT'));

CREATE POLICY "Staff can create movements"
  ON inventory_movements FOR INSERT TO authenticated
  WITH CHECK (auth.user_has_role('PRACTITIONER') OR auth.user_has_role('ASSISTANT'));

-- Treatments table policies
CREATE POLICY "Admins have full access to treatments"
  ON treatments FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Practitioners can manage treatments"
  ON treatments FOR ALL TO authenticated
  USING (auth.user_has_role('PRACTITIONER'))
  WITH CHECK (auth.user_has_role('PRACTITIONER'));

CREATE POLICY "Assistants can view and create treatments"
  ON treatments FOR SELECT TO authenticated
  USING (auth.user_has_role('ASSISTANT'));

CREATE POLICY "Assistants can create treatments"
  ON treatments FOR INSERT TO authenticated
  WITH CHECK (auth.user_has_role('ASSISTANT'));

-- Treatment products policies
CREATE POLICY "Admins have full access to treatment products"
  ON treatment_products FOR ALL TO authenticated
  USING (auth.user_has_role('ADMIN'))
  WITH CHECK (auth.user_has_role('ADMIN'));

CREATE POLICY "Practitioners can manage treatment products"
  ON treatment_products FOR ALL TO authenticated
  USING (auth.user_has_role('PRACTITIONER'))
  WITH CHECK (auth.user_has_role('PRACTITIONER'));

CREATE POLICY "Assistants can view and create treatment products"
  ON treatment_products FOR SELECT TO authenticated
  USING (auth.user_has_role('ASSISTANT'));

CREATE POLICY "Assistants can create treatment products"
  ON treatment_products FOR INSERT TO authenticated
  WITH CHECK (auth.user_has_role('ASSISTANT'));
