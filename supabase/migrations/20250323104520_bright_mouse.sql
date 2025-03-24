/*
  # Création de la table patients et des politiques de sécurité

  1. Nouvelle Table
    - `patients`
      - `id` (uuid, clé primaire)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `date_of_birth` (date)
      - `medical_history` (jsonb)
      - `dental_history` (jsonb)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Sécurité
    - Activation RLS sur la table patients
    - Politiques pour :
      - Lecture : praticiens et assistants peuvent lire tous les patients
      - Création : praticiens et assistants peuvent créer des patients
      - Modification : praticiens et assistants peuvent modifier les patients
      - Suppression : seuls les praticiens peuvent supprimer des patients
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  date_of_birth date,
  medical_history jsonb DEFAULT '{
    "allergies": [],
    "medications": [],
    "conditions": [],
    "notes": ""
  }'::jsonb,
  dental_history jsonb DEFAULT '{
    "lastCheckup": null,
    "treatments": [],
    "implants": [],
    "notes": ""
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation du Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Politique de lecture
CREATE POLICY "Les utilisateurs authentifiés peuvent lire tous les patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique de création
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politique de modification
CREATE POLICY "Les utilisateurs authentifiés peuvent modifier les patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique de suppression (uniquement pour les praticiens)
CREATE POLICY "Seuls les praticiens peuvent supprimer des patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'PRACTITIONER'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
