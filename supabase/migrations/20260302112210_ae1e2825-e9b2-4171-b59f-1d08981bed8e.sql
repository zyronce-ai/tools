INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-temp', 'ai-temp', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view ai-temp files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ai-temp');

CREATE POLICY "Public can upload ai-temp files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ai-temp');

CREATE POLICY "Public can update ai-temp files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ai-temp')
WITH CHECK (bucket_id = 'ai-temp');

CREATE POLICY "Public can delete ai-temp files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ai-temp');