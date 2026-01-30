-- Storage Bucket Configuration for Supabase
-- Run this after creating the bucket 'inspection-photos' in Supabase Dashboard

-- Storage policies for inspection-photos bucket
-- Note: Bucket must be created first via Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create new bucket: inspection-photos
-- 3. Set as private (not public)
-- 4. Then run these policies

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inspection-photos');

-- Allow authenticated users to read all photos
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'inspection-photos');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'inspection-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins/QC to delete photos
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'inspection-photos'
    AND EXISTS (
        SELECT 1 FROM operators
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'qc')
    )
);
