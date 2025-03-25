CREATE TABLE IF NOT EXISTS product_orders (
    product_id UUID PRIMARY KEY REFERENCES products(id),
    order_date TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow authenticated read" ON product_orders FOR SELECT TO authenticated USING (TRUE);
  CREATE POLICY "Allow authenticated insert" ON product_orders FOR INSERT TO authenticated WITH CHECK (TRUE);
  CREATE POLICY "Allow authenticated update" ON product_orders FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
  CREATE POLICY "Allow authenticated delete" ON product_orders FOR DELETE TO authenticated USING (TRUE);
