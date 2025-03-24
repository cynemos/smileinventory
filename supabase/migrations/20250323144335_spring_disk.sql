/*
  # Fix RLS Policies

  1. Modifications
    - Ajout d'une fonction pour vérifier le rôle de l'utilisateur
    - Mise à jour des politiques pour les patients
    - Ajout de politiques pour les assistants

  2. Sécurité
    - Vérification des rôles utilisateur
    - Permissions basées sur les rôles
*/

-- Fonction pour vérifier le rôle de l'utilisateur
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  -- Vérifie si l'utilisateur a le rôle requis
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (
      -- L'utilisateur a soit le rôle exact requis
      raw_user_meta_data->>'role' = required_role
      OR
      -- Soit le rôle ADMIN qui a tous les droits
      raw_user_meta_data->>'role' = 'ADMIN'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Accès complet pour les utilisateurs authentifiés" ON patients;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des patients" ON patients;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire tous les patients" ON patients;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent modifier les patients" ON patients;
DROP POLICY IF EXISTS "Seuls les praticiens peuvent supprimer des patients" ON patients;

-- Nouvelles politiques pour la table patients
CREATE POLICY "Les praticiens peuvent gérer les patients"
  ON patients FOR ALL TO authenticated
  USING (auth.user_has_role('PRACTITIONER'))
  WITH CHECK (auth.user_has_role('PRACTITIONER'));

CREATE POLICY "Les assistants peuvent voir les patients"
  ON patients FOR SELECT TO authenticated
  USING (auth.user_has_role('ASSISTANT'));

CREATE POLICY "Les assistants peuvent créer des patients"
  ON patients FOR INSERT TO authenticated
  WITH CHECK (auth.user_has_role('ASSISTANT'));

CREATE POLICY "Les assistants peuvent mettre à jour les patients"
  ON patients FOR UPDATE TO authenticated
  USING (auth.user_has_role('ASSISTANT'))
  WITH CHECK (auth.user_has_role('ASSISTANT'));
