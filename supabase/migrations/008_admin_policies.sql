-- Admin privileges without recursive RLS on profiles

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Messages: admins can read any order chat
DROP POLICY IF EXISTS "Messages viewable by order participants" ON messages;
DROP POLICY IF EXISTS "Messages viewable by order participants or admin" ON messages;
CREATE POLICY "Messages viewable by order participants or admin" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND (buyer_id = auth.uid() OR maker_id = auth.uid())
    )
    OR public.is_admin()
  );

-- Profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
CREATE POLICY "Admins can delete any profile" ON profiles
  FOR DELETE USING (public.is_admin());

-- Maker profiles
DROP POLICY IF EXISTS "Admins can update any maker profile" ON maker_profiles;
CREATE POLICY "Admins can update any maker profile" ON maker_profiles
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any maker profile" ON maker_profiles;
CREATE POLICY "Admins can delete any maker profile" ON maker_profiles
  FOR DELETE USING (public.is_admin());
