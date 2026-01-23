'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X
} from 'lucide-react'
import { productService, CreateProductRequest } from '@/services/product.service'
import { vendorService } from '@/services/vendor.service'
import { Vendor } from '@/services/vendor.service'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

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
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

    if (file.size > 15 * 1024 * 1024) {
      setErrors({ ...errors, image_url: 'Image size must be less than 15MB' })
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image_url: 'Only image files are allowed' })
      return
    }

    try {
      setUploading(true)
      setErrors({ ...errors, image_url: '' })

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
    } catch (error) {
      console.error('Error uploading image:', error)
      let errorMessage = 'Failed to upload image'
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
    if (!formData.vendor_id) newErrors.vendor_id = 'Please select a vendor'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)

    try {
      const productData: CreateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        base_price: parseFloat(formData.base_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        inventory_quantity: parseInt(formData.inventory_quantity),
        vendor_id: formData.vendor_id,
        image_url: formData.image_url || undefined,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        type: formData.type
      }

      await productService.createProduct(productData)
      
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Header />

        <main className="flex-1">
          <section className="relative py-8 lg:py-12 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            </div>

            <div className="container relative px-4 max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Admin
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                      <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                        Add New Product
                      </span>
                    </h1>
                    <p className="text-muted-foreground">Create a new product for your BullRhun inventory</p>
                  </div>
                </div>

                {success && (
                  <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="p-6 text-center">
                      <div className="text-green-500 mb-2">✓</div>
                      <h3 className="text-lg font-medium mb-2">Product Created Successfully!</h3>
                      <p className="text-sm text-muted-foreground">Redirecting to admin dashboard...</p>
                    </CardContent>
                  </Card>
                )}

                {submitError && (
                  <Card className="border-red-500/50 bg-red-500/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <h3 className="text-lg font-medium mb-1">Error</h3>
                          <p className="text-sm text-muted-foreground">{submitError}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!success && (
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Basic Information
                          </CardTitle>
                          <CardDescription>
                            Enter product details. All fields marked with * are required.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="name">
                                  Product Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                  placeholder="Enter product name"
                                  className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                  <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.name}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="base_price">
                                  Price <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="base_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.base_price}
                                    onChange={(e) => handleInputChange('base_price', e.target.value)}
                                    placeholder="0.00"
                                    className="pl-10"
                                  />
                                </div>
                                {errors.base_price && (
                                  <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.base_price}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="inventory_quantity">
                                  Inventory <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="inventory_quantity"
                                  type="number"
                                  min="0"
                                  value={formData.inventory_quantity}
                                  onChange={(e) => handleInputChange('inventory_quantity', e.target.value)}
                                  placeholder="100"
                                />
                                {errors.inventory_quantity && (
                                  <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.inventory_quantity}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="vendor_id">
                                  Vendor <span className="text-red-500">*</span>
                                </Label>
                                <select
                                  id="vendor_id"
                                  value={formData.vendor_id}
                                  onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                                  className={errors.vendor_id ? 'border-red-500' : ''}
                                >
                                  <option value="">Select a vendor</option>
                                  {vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                      {vendor.name}
                                    </option>
                                  ))}
                                </select>
                                {errors.vendor_id && (
                                  <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.vendor_id}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="description">
                                Description <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe your product..."
                                rows={4}
                              />
                              {errors.description && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.description}
                                </p>
                              )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="type">
                                  Product Type
                                </Label>
                                <select
                                  id="type"
                                  value={formData.type}
                                  onChange={(e) => handleInputChange('type', e.target.value)}
                                >
                                  {productTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="is_featured">
                                  Featured Product
                                </Label>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="is_featured" className="text-sm font-medium">
                                    Display on homepage
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="is_active">
                                  Status
                                </Label>
                                <select
                                  id="is_active"
                                  value={formData.is_active ? 'active' : 'draft'}
                                  onChange={(e) => handleInputChange('is_active', Boolean(e.target.value === 'active'))}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="active">Active</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                              <Link href="/admin">
                                <Button variant="outline">
                                  Cancel
                                </Button>
                              </Link>
                              <Button
                                type="submit"
                                disabled={loading}
                              >
                                {loading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                {loading ? 'Creating Product...' : 'Create Product'}
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            Product Image
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Upload Image</Label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button
                              type="button"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={uploading}
                              className="w-full justify-start"
                            >
                              {uploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
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
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.image_url}
                              </p>
                            )}
                            {formData.image_url && (
                              <Button
                                type="button"
                                onClick={() => handleInputChange('image_url', '')}
                                variant="outline"
                                className="w-full"
                              >
                                Remove Image
                              </Button>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Max file size: 15MB. Formats: JPG, PNG, GIF
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            Live Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden">
                              {previewImage ? (
                                <img 
                                  src={previewImage} 
                                  alt="Product preview" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                              <h3 className="font-semibold truncate">
                                {formData.name || 'Product Name'}
                              </h3>
                              <div className="text-sm text-muted-foreground line-clamp-3">
                                {formData.description || 'Product description will appear here...'}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-primary">
                                  ${formData.base_price || '0.00'}
                                </span>
                                <Badge variant={formData.is_active ? 'default' : 'secondary'}>
                                  {formData.is_active ? 'Active' : 'Draft'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-primary/20 rounded-xl p-8 max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Product Created Successfully!</h3>
                <p className="text-muted-foreground">
                  The product "{formData.name}" has been successfully added to your inventory.
                </p>
              </div>
              <div className="flex justify-center">
                <Button 
                  onClick={() => setShowSuccessModal(false)}
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-red-500/30 rounded-xl p-8 max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Error Creating Product</h3>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={() => setShowErrorModal(false)}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/admin')}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
