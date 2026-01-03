# Supabase Storage Policies Setup

## Apply these policies to your Supabase project:

### 1. Run in Supabase SQL Editor:
```sql
-- Create a policy to allow authenticated users to upload to product-images bucket
CREATE POLICY "product_images_upload" ON storage.buckets
FOR ALL USING (
  -- Allow uploads if user is authenticated
  auth.role() = 'authenticated'
);

-- Create a policy to allow anyone to view images from product-images bucket  
CREATE POLICY "product_images_public" ON storage.buckets
FOR SELECT USING (
  -- Allow anyone to view images
  true
);

-- Apply policies to the product-images bucket
ALTER storage.buckets ENABLE ROW LEVEL SECURITY;
```

### 2. Or apply via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **Storage** section
3. Click on **Policies** tab
4. Add these two policies:

**Policy 1: product_images_upload**
- Bucket: `product-images`
- Allowed Operations: INSERT, UPDATE
- Policy Definition: `auth.role() = 'authenticated'`

**Policy 2: product_images_public**  
- Bucket: `product-images`
- Allowed Operations: SELECT
- Policy Definition: `true`

### 3. Alternative: Use Service Role Key
If you continue getting RLS errors, you can use the service_role key in uploads:

```typescript
// In your image upload function, add service_role to headers
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    headers: {
      'x-upsert': 'true'
    }
  })
```

### Current Error:
- **StorageApiError**: Row Level Security policy is blocking uploads
- **Solution**: Apply the policies above to allow authenticated uploads

### After applying policies:
1. ✅ Image uploads will work properly
2. ✅ Public access to images will be enabled  
3. ✅ No more RLS policy violations