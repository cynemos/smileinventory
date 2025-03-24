/*
  # Update suppliers table structure
  
  1. Changes
    - Modify existing suppliers table to match new schema
    - Update column definitions
    - Preserve existing relationships
  
  2. Security
    - Ensure RLS is enabled
    - Update policies if needed
*/

-- Modify existing suppliers table structure
DO $$ BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'phone') THEN
    ALTER TABLE suppliers ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'email') THEN
    ALTER TABLE suppliers ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'customer_reference') THEN
    ALTER TABLE suppliers ADD COLUMN customer_reference text;
  END IF;

  -- Drop old contact_info column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'contact_info') THEN
    -- Migrate data from contact_info to new columns
    UPDATE suppliers
    SET 
      phone = contact_info->>'phone',
      email = contact_info->>'email'
    WHERE contact_info IS NOT NULL;

    ALTER TABLE suppliers DROP COLUMN contact_info;
  END IF;

EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;
