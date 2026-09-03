-- Contact fields for manufacturer profiles
ALTER TABLE maker_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_person TEXT;
