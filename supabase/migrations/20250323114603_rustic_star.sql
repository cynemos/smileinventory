/*
  # Add treatments management tables

  1. New Tables
    - `treatments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `date` (timestamptz)
      - `type` (text) - Type of treatment (IMPLANT, CLEANING, etc.)
      - `notes` (text)
      - `cost` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
    
    - `treatment_products`
      - `id` (uuid, primary key)
      - `treatment_id` (uuid, references treatments)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create treatments table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS treatments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    date timestamptz NOT NULL DEFAULT now(),
    type text NOT NULL,
    notes text,
    cost numeric(10,2) NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    CONSTRAINT valid_treatment_type CHECK (type = ANY (ARRAY['IMPLANT'::text, 'CLEANING'::text, 'EXTRACTION'::text, 'FILLING'::text, 'CROWN'::text, 'OTHER'::text]))
  );
END $$;

-- Create treatment_products table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS treatment_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id uuid REFERENCES treatments(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    created_at timestamptz DEFAULT now()
  );
END $$;

-- Enable RLS
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_products ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatments' 
    AND policyname = 'Authenticated users can read treatments'
  ) THEN
    CREATE POLICY "Authenticated users can read treatments"
      ON treatments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatments' 
    AND policyname = 'Authenticated users can insert treatments'
  ) THEN
    CREATE POLICY "Authenticated users can insert treatments"
      ON treatments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatments' 
    AND policyname = 'Authenticated users can update their treatments'
  ) THEN
    CREATE POLICY "Authenticated users can update their treatments"
      ON treatments
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_products' 
    AND policyname = 'Authenticated users can read treatment products'
  ) THEN
    CREATE POLICY "Authenticated users can read treatment products"
      ON treatment_products
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_products' 
    AND policyname = 'Authenticated users can insert treatment products'
  ) THEN
    CREATE POLICY "Authenticated users can insert treatment products"
      ON treatment_products
      FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM treatments
        WHERE id = treatment_id
        AND created_by = auth.uid()
      ));
  END IF;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_treatments_updated_at'
  ) THEN
    CREATE TRIGGER update_treatments_updated_at
      BEFORE UPDATE ON treatments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
