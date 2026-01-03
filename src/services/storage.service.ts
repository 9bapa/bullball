import { supabase } from '@/lib/supabase'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export class StorageService {
  private static readonly BUCKET_NAME = 'product-images'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  /**
   * Upload a product image to Supabase storage
   */
  static async uploadProductImage(
    file: File,
    productId?: string
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { url: '', path: '', error: validation.error }
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = productId 
        ? `products/${productId}/${fileName}`
        : `products/${fileName}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Storage upload error:', error)
        return { 
          url: '', 
          path: '', 
          error: `Upload failed: ${error.message}` 
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('Unexpected upload error:', error)
      return {
        url: '',
        path: '',
        error: 'Unexpected upload error occurred'
      }
    }
  }

  /**
   * Delete an image from Supabase storage
   */
  static async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path])

      if (error) {
        return { 
          success: false, 
          error: `Delete failed: ${error.message}` 
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected delete error:', error)
      return {
        success: false,
        error: 'Unexpected delete error occurred'
      }
    }
  }

  /**
   * Upload multiple images for a product
   */
  static async uploadProductImages(
    files: File[],
    productId: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadProductImage(file, productId)
    )

    return Promise.all(uploadPromises)
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type must be one of: ${this.ALLOWED_TYPES.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Transform image for display (if needed in the future)
   */
  static async transformImage(
    path: string,
    options: {
      width?: number
      height?: number
      quality?: number
    } = {}
  ): Promise<string> {
    const { width, height, quality = 80 } = options
    
    // For now, return the original URL
    // In the future, you could implement image transformation here
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path)

    return publicUrl
  }

  /**
   * Create the bucket if it doesn't exist
   */
  static async ensureBucketExists(): Promise<boolean> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === this.BUCKET_NAME)

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(
          this.BUCKET_NAME,
          {
            public: true,
            allowedMimeTypes: this.ALLOWED_TYPES,
            fileSizeLimit: this.MAX_FILE_SIZE
          }
        )

        if (error) {
          console.error('Error creating bucket:', error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error ensuring bucket exists:', error)
      return false
    }
  }
}