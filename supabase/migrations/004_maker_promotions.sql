-- Maker profile promotion on homepage
ALTER TABLE maker_profiles
  ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS promo_headline TEXT,
  ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS maker_profiles_promoted_idx
  ON maker_profiles (promoted_at DESC NULLS LAST)
  WHERE is_promoted = TRUE;

COMMENT ON COLUMN maker_profiles.is_promoted IS 'Show mini profile ad on homepage';
COMMENT ON COLUMN maker_profiles.promo_headline IS 'Short ad text shown on homepage card';
COMMENT ON COLUMN maker_profiles.promoted_at IS 'When promotion was last enabled (for ordering)';
