-- Create public storage bucket for letter design assets (logos and background images)
-- Run this manually in the Supabase Dashboard → SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('letter-design-assets', 'letter-design-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload own assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'letter-design-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "public read design assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'letter-design-assets');

CREATE POLICY "users delete own assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'letter-design-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
