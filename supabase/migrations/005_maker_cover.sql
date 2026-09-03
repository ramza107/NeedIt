-- Cover banner image for maker storefront profile
ALTER TABLE maker_profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

COMMENT ON COLUMN maker_profiles.cover_url IS 'Banner image for public maker profile page';
