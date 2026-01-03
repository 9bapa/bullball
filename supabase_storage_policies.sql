-- Create a policy to allow authenticated users to upload to product-images bucket
CREATE POLICY "product_images_upload" ON storage.buckets
FOR ALL USING (
  -- Allow uploads if user is authenticated
  auth.role() = 'authenticated'
);

-- Create a policy to allow public access to product-images bucket
CREATE POLICY "product_images_public" ON storage.buckets
FOR SELECT USING (
  -- Allow anyone to view images
  true
);

-- Apply policies to the product-images bucket
ALTER storage.buckets ENABLE ROW LEVEL SECURITY;