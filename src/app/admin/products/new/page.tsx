'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Save, 
  Eye, 
  Package,
  DollarSign,
  Tag,
  Box,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { supabaseService } from '@/lib/supabase'
import { productService } from '@/services/product.service'
import { vendorService } from '@/services/vendor.service'
import Link from 'next/link'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { AdminProtectedRoute } from '@/components/wallet_solana/AdminGate'

interface ProductFormData {
  name: string
  description: string
  base_price: string
  cost_price: string
  inventory_quantity: string
  vendor_id: string
  image_url: string
  is_active: boolean
  is_featured: boolean
  type: string
}

const productTypes = [
  'sticker',
  'hoodie',
  'shirt',
  'hat',
  'accessory',
  'socks',
  'mug',
  'cup',
  'apparel',
  'poster',
  'bag',
  'phone_case',
  'towel',
  'blanket'
]

export default function AddProductPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: '',
    cost_price: '',
    inventory_quantity: '100',
    vendor_id: '',
    image_url: '',
    is_active: true,
    is_featured: false,
    type: 'sticker'
  })
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [vendors, setVendors] = useState<any[]>([])

  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const vendorsData = await vendorService.getAllVendors()
      setVendors(vendorsData || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image_url: 'Image size must be less than 5MB' })
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image_url: 'Only image files are allowed' })
      return
    }

    setUploading(true)
    setErrors({ ...errors, image_url: '' })

    try {
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `images/${fileName}`

      try {
        const { data: uploadData, error: uploadError } = await supabaseService.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw uploadError
        }
      } catch (storageError: unknown) {
        // Fallback if storage policies aren't set up
        console.warn('Storage policies not configured, using base64 fallback')
        
        // Create base64 fallback
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        
        const base64Data = await base64Promise
        setFormData({ 
          ...formData, 
          image_url: base64Data 
        })
        setPreviewImage(base64Data)
        return
      }

      // Get public URL
      const { data: urlData } = supabaseService.storage
        .from('images')
        .getPublicUrl(filePath)

      setFormData({ 
        ...formData, 
        image_url: urlData.publicUrl 
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      let errorMessage = 'Failed to upload image'
      
      if (error && typeof error === 'object') {
        errorMessage = (error as any).message || (error as any).error || errorMessage
      }
      
      setErrors({ ...errors, image_url: errorMessage })
    } finally {
      setUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) newErrors.base_price = 'Base price is required'
    if (!formData.inventory_quantity || parseInt(formData.inventory_quantity) < 0) newErrors.inventory_quantity = 'Valid inventory is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)

    try {
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        base_price: parseFloat(formData.base_price),
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
          inventory_quantity: parseInt(formData.inventory_quantity),
        vendor_id: formData.vendor_id || undefined,
        image_url: formData.image_url || undefined,
        is_active: formData.is_active,
        type: formData.type
      }

      const product = await productService.createProduct(productData)
      
      setSuccess(true)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        router.push('/admin')
      }, 3000)
    } catch (error) {
      console.error('Error submitting product:', error)
      const errorMsg = `An unexpected error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`
      setErrorMessage(errorMsg)
      setShowErrorModal(true)
      setSubmitError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div 
            className="h-full w-full" 
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.02) 1px, transparent 1px)`,
              backgroundSize: '50px 50px' 
            }} 
          />
        </div>

        <SharedHeader />
        
        <div className="relative mt-10">
          <div className="container mx-auto px-4 py-8 md:py-12 mt-10">
            <div className="space-y-6 mt-10">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Admin
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-none mb-2">
                      Add New Product
                    </h1>
                    <p className="text-gray-400 text-lg">
                      Create a new product for your BullRhun inventory
                    </p>
                  </div>
                    </div>

                    {/* Cost Price */}
                    <div className="space-y-2">
                      <Label htmlFor="cost_price" className="text-sm font-medium text-gray-300">
                        Cost Price
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="cost_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.cost_price}
                          onChange={(e) => handleInputChange('cost_price', e.target.value)}
                          placeholder="0.00"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-400" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                            Product Name <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter product name"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                          />
                          {errors.name && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium text-gray-300">
                            Price <span className="text-red-400">*</span>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.base_price}
                            onChange={(e) => handleInputChange('base_price', e.target.value)}
                              placeholder="0.00"
                              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                            />
                          </div>
                          {errors.base_price && (
                              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.base_price}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="inventory_quantity" className="text-sm font-medium text-gray-300">
                            Inventory <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="inventory_quantity"
                            type="number"
                            min="0"
                            value={formData.inventory_quantity}
                            onChange={(e) => handleInputChange('inventory_quantity', e.target.value)}
                            placeholder="100"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                          />
                          {errors.inventory_quantity && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.inventory_quantity}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vendor_id" className="text-sm font-medium text-gray-300">
                            Vendor
                          </Label>
                          <select
                            id="vendor_id"
                            value={formData.vendor_id}
                            onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:border-emerald-500/50"
                          >
                            <option value="">Select a vendor</option>
                            {vendors.map((vendor) => (
                              <option key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </option>
                            ))}
                          </select>
                          {errors.vendor_id && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.vendor_id}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                          Description <span className="text-red-400">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your product..."
                          rows={4}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                        />
                        {errors.description && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Details */}
                  <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-400" />
                        Product Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="type" className="text-sm font-medium text-gray-300">
                            Product Type
                          </Label>
                          <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:border-emerald-500/50"
                          >
                            {productTypes.map((type) => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </option>
                            ))}
                          </select>
                          {errors.type && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.type}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                            Status
                          </Label>
                          <select
                            id="is_active"
                            value={formData.is_active ? 'active' : 'draft'}
                            onChange={(e) => handleInputChange('is_active', Boolean(e.target.value === 'active'))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:border-emerald-500/50"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                          </select>
                          {errors.is_active && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.is_active}
                            </p>
                          )}
                        </div>

                        {/* Featured Status */}
                        <div className="space-y-2">
                          <Label htmlFor="is_featured" className="text-sm font-medium text-gray-300">
                            Featured Product
                          </Label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="is_featured"
                              checked={formData.is_featured}
                              onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                              className="h-4 w-4 text-emerald-500 border-white/20 rounded focus:ring-emerald-500/20 bg-white/10"
                            />
                            <Label htmlFor="is_featured" className="text-sm text-gray-300">
                              Display on homepage
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Image Upload & Preview */}
                <div className="space-y-6">
                  {/* Image Upload */}
                  <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-orange-400" />
                        Product Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-300">Upload Image</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full justify-start text-meme-orange hover:bg-meme-orange/10"
                        >
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400 mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose Image
                            </>
                          )}
                        </Button>
                        {errors.image_url && (
                          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.image_url}
                          </p>
                        )}
                        {formData.image_url && (
                          <Button
                            type="button"
                            onClick={() => handleInputChange('image_url', '')}
                            variant="outline"
                            className="w-full mt-2 text-red-400 hover:bg-red-500/10"
                          >
                            Remove Image
                          </Button>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Max file size: 5MB. Formats: JPG, PNG, GIF
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live Preview */}
                  <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Eye className="h-5 w-5 text-emerald-400" />
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Product Image */}
                        <div className="aspect-video bg-white/5 rounded-lg overflow-hidden">
                          {previewImage ? (
                            <img 
                              src={previewImage} 
                              alt="Product preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                          <h3 className="font-semibold text-white truncate">
                            {formData.name || 'Product Name'}
                          </h3>
                          <div className="text-sm text-gray-300 line-clamp-3">
                            {formData.description || 'Product description will appear here...'}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-emerald-400">
                              ${formData.base_price || '0.00'}
                            </span>
                            <Badge className={formData.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}>
                              {formData.is_active ? 'Active' : 'Draft'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                    <CardContent>
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full text-meme-green hover:bg-meme-green/10"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Product...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Product
                          </>
                        )}
                      </Button>

                      {submitError && (
                        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {submitError}
                          </p>
                        </div>
                      )}

                      {success && (
                        <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                          <p className="text-sm text-emerald-400 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Product Created Successfully!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-8 max-w-md w-full backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Product Created Successfully!</h3>
                  <p className="text-gray-400">
                    The product "{formData.name}" has been successfully added to your inventory.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setShowSuccessModal(false)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 max-w-md w-full backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Error Creating Product</h3>
                  <p className="text-gray-400">
                    {errorMessage}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => setShowErrorModal(false)}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => router.push('/admin')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Back to Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <SharedFooter />
      </div>
    </AdminProtectedRoute>
  )
}