/*
  # Mise à jour des politiques de sécurité

  1. Modifications
    - Suppression des anciennes politiques restrictives
    - Création de nouvelles politiques permettant un accès complet aux utilisateurs authentifiés
    - Application sur toutes les tables :
      - patients
      - suppliers
      - products
      - inventory_items
      - inventory_movements
      - treatments
      - treatment_products

  2. Sécurité
    - Maintien de RLS activé sur toutes les tables
    - Accès complet pour les utilisateurs authentifiés
    - Aucun accès pour les utilisateurs non authentifiés
*/

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des patients" ON patients;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire tous les patients" ON patients;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent modifier les patients" ON patients;
DROP POLICY IF EXISTS "Seuls les praticiens peuvent supprimer des patients" ON patients;

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les fournisseurs" ON suppliers;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent modifier les fournisseurs" ON suppliers;

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les produits" ON products;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent modifier les produits" ON products;

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les articles en stock" ON inventory_items;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent modifier les articles en stock" ON inventory_items;

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les mouvements" ON inventory_movements;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des mouvements" ON inventory_movements;

DROP POLICY IF EXISTS "Authenticated users can read treatments" ON treatments;
DROP POLICY IF EXISTS "Authenticated users can insert treatments" ON treatments;
DROP POLICY IF EXISTS "Authenticated users can update their treatments" ON treatments;

DROP POLICY IF EXISTS "Authenticated users can read treatment products" ON treatment_products;
DROP POLICY IF EXISTS "Authenticated users can insert treatment products" ON treatment_products;

-- Création des nouvelles politiques pour un accès complet
CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON patients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON suppliers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON inventory_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON inventory_movements
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON treatments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Accès complet pour les utilisateurs authentifiés" ON treatment_products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
