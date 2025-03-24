/*
  # Création des tables pour la gestion des stocks

  1. Nouvelles Tables
    - `suppliers` : Informations sur les fournisseurs
      - `id` (uuid, primary key)
      - `name` (text)
      - `contact_info` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products` : Catalogue des produits
      - `id` (uuid, primary key)
      - `sku` (text, unique)
      - `name` (text)
      - `category` (text)
      - `description` (text)
      - `supplier_id` (uuid, foreign key)
      - `unit_cost` (numeric)
      - `sale_price` (numeric)
      - `reorder_point` (integer)
      - `reorder_quantity` (integer)
      - `storage_location` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `inventory_items` : Stock actuel des produits
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `batch_number` (text)
      - `quantity` (integer)
      - `expiration_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `inventory_movements` : Historique des mouvements
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `type` (text)
      - `quantity` (integer)
      - `batch_number` (text)
      - `reference` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Création de la table des fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_info jsonb DEFAULT '{"email": "", "phone": "", "address": ""}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des produits
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  supplier_id uuid REFERENCES suppliers(id),
  unit_cost numeric(10,2) NOT NULL,
  sale_price numeric(10,2) NOT NULL,
  reorder_point integer NOT NULL DEFAULT 0,
  reorder_quantity integer NOT NULL DEFAULT 0,
  storage_location text,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'))
);

-- Création de la table des articles en stock
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  batch_number text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  expiration_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Création de la table des mouvements de stock
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  type text NOT NULL,
  quantity integer NOT NULL,
  batch_number text NOT NULL,
  reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_type CHECK (type IN ('IN', 'OUT'))
);

-- Activation de la sécurité RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Création des politiques de sécurité
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les fournisseurs"
  ON suppliers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent modifier les fournisseurs"
  ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent lire les produits"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent modifier les produits"
  ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent lire les articles en stock"
  ON inventory_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent modifier les articles en stock"
  ON inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent lire les mouvements"
  ON inventory_movements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des mouvements"
  ON inventory_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Création des triggers pour la mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Création des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiration_date ON inventory_items(expiration_date);
