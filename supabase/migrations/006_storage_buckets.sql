-- Storage buckets and policies for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('portfolio', 'portfolio', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('request-images', 'request-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('completions', 'completions', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('chat-attachments', 'chat-attachments', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;
CREATE POLICY "Public read portfolio" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Public read request-images" ON storage.objects;
CREATE POLICY "Public read request-images" ON storage.objects FOR SELECT USING (bucket_id = 'request-images');
DROP POLICY IF EXISTS "Public read completions" ON storage.objects;
CREATE POLICY "Public read completions" ON storage.objects FOR SELECT USING (bucket_id = 'completions');
DROP POLICY IF EXISTS "Public read chat-attachments" ON storage.objects;
CREATE POLICY "Public read chat-attachments" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');

-- Authenticated upload to own folder (first path segment = user id)
DROP POLICY IF EXISTS "Users upload avatars" ON storage.objects;
CREATE POLICY "Users upload avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users update avatars" ON storage.objects;
CREATE POLICY "Users update avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users upload portfolio" ON storage.objects;
CREATE POLICY "Users upload portfolio" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users update portfolio" ON storage.objects;
CREATE POLICY "Users update portfolio" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users upload request-images" ON storage.objects;
CREATE POLICY "Users upload request-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'request-images' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users update request-images" ON storage.objects;
CREATE POLICY "Users update request-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'request-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users upload completions" ON storage.objects;
CREATE POLICY "Users upload completions" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'completions' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users upload chat" ON storage.objects;
CREATE POLICY "Users upload chat" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
