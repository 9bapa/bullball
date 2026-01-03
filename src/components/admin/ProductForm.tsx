'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Plus, Trash2, Save, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const supabaseClient = (supabase)!;
import { StorageService } from '@/services/storage.service'
import { vendorService } from '@/services/vendor.service'

interface ProductFormData {
  name: string
  description: string
  sku: string
  price: number
  compare_price?: number
  cost_per_item?: number
  weight?: number
  category: string
  subcategory?: string
  brand?: string
  tags: string[]
  vendor_id: string
  track_inventory: boolean
  inventory_quantity: number
  min_threshold: number
  max_stock: number
  requires_shipping: boolean
  taxable: boolean
  status: 'active' | 'draft' | 'archived'
  seo_title?: string
  seo_description?: string
  meta_keywords?: string[]
  images: ProductImage[]
  variants: ProductVariant[]
}

interface ProductImage {
  id?: string
  url: string
  alt_text?: string
  position: number
  file?: File
}

interface ProductVariant {
  id?: string
  name: string
  sku: string
  price: number
  inventory_quantity: number
  color?: string
  size?: string
  options?: { [key: string]: string }
}

const categories = [
  'Sticker',
  'Clothing', 
  'Hats',
  'Accessories',
  'Shirt',
  'Backpack',
  'Gifts',
  'Whiskey'
]

const clothingSubcategories = ['T-Shirts', 'Hoodies', 'Long Sleeve', 'Tank Tops', 'Jerseys', 'Pijamas', 'Socks']
const accessoriesSubcategories = ['Phone Cases', 'Keychains', 'Bags', 'Wallets']
const hatsSubcategories = ['Baseball Caps', 'Beanies', 'Bucket Hats', 'Trucker Hats']

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendors, setVendors] = useState<any[]>([])
  const [imageUploads, setImageUploads] = useState<{ [key: string]: number }>({})
  const [previewMode, setPreviewMode] = useState(false)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    category: '',
    tags: [],
    vendor_id: '',
    track_inventory: true,
    inventory_quantity: 0,
    min_threshold: 5,
    max_stock: 100,
    requires_shipping: true,
    taxable: true,
    status: 'draft',
    images: [],
    variants: []
  })

  const [newTag, setNewTag] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    fetchVendors()
    if (productId) {
      fetchProduct(productId)
    }
  }, [productId])

  const fetchVendors = async () => {
    try {
      const data = await vendorService.getVendors()
      setVendors(data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const fetchProduct = async (id: string) => {
    setLoading(true)
    try {
      const { data: product, error } = await supabaseClient
        .from('bullrhun_products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Fetch product images
      const { data: images } = await supabaseClient
        .from('bullrhun_product_images')
        .select('*')
        .eq('product_id', id)
        .order('position')

      // Fetch inventory
      const { data: inventory } = await supabaseClient
        .from('bullrhun_inventory')
        .select('*')
        .eq('product_id', id)
        .single()

      setFormData({
        ...product,
        tags: product.tags || [],
        inventory_quantity: inventory?.quantity || 0,
        min_threshold: inventory?.min_threshold || 5,
        max_stock: inventory?.max_stock || 100,
        images: images || []
      })
    } catch (error) {
      setError('Error loading product')
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    const newFiles = Array.from(files)
    setSelectedFiles(prev => [...prev, ...newFiles])

    // Create preview URLs for immediate display
    const newImages: ProductImage[] = newFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      alt_text: '',
      position: formData.images.length + index,
      file
    }))

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      name: '',
      sku: '',
      price: formData.price,
      inventory_quantity: 0,
      color: '',
      size: '',
      options: {}
    }
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Upload images first
      const uploadedImages: any[] = []
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i]
        if (image.file) {
          setImageUploads(prev => ({ ...prev, [i]: 0 }))
          
          const uploadResult = await StorageService.uploadProductImage(
            image.file,
            productId || undefined
          )

          if (uploadResult.error) {
            throw new Error(`Image upload failed: ${uploadResult.error}`)
          }

          uploadedImages.push({
            url: uploadResult.url,
            alt_text: image.alt_text,
            position: i
          })
        } else {
          uploadedImages.push({
            url: image.url,
            alt_text: image.alt_text,
            position: i
          })
        }
      }

      // Save product
      const productData = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        price: formData.price,
        compare_price: formData.compare_price,
        cost_per_item: formData.cost_per_item,
        weight: formData.weight,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        tags: formData.tags,
        vendor_id: formData.vendor_id,
        requires_shipping: formData.requires_shipping,
        taxable: formData.taxable,
        status: formData.status,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        meta_keywords: formData.meta_keywords,
        updated_at: new Date().toISOString()
      }

      let savedProduct
      if (productId) {
        const { data, error } = await supabaseClient
          .from('bullrhun_products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single()
        
        if (error) throw error
        savedProduct = data
      } else {
        const { data, error } = await supabaseClient
          .from('bullrhun_products')
          .insert({
            ...productData,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) throw error
        savedProduct = data
      }

      // Save images
      if (uploadedImages.length > 0) {
        // Delete existing images for updates
        if (productId) {
          await supabaseClient
            .from('bullrhun_product_images')
            .delete()
            .eq('product_id', productId)
        }

        const imagesToInsert = uploadedImages.map(img => ({
          product_id: savedProduct.id,
          url: img.url,
          alt_text: img.alt_text,
          position: img.position
        }))

        await supabaseClient
          .from('bullrhun_product_images')
          .insert(imagesToInsert)
      }

      // Save inventory
      const inventoryData = {
        product_id: savedProduct.id,
        quantity: formData.inventory_quantity,
        min_threshold: formData.min_threshold,
        max_stock: formData.max_stock,
        last_updated: new Date().toISOString()
      }

      if (productId) {
        await supabaseClient
          .from('bullrhun_inventory')
          .update(inventoryData)
          .eq('product_id', productId)
      } else {
        await supabaseClient
          .from('bullrhun_inventory')
          .insert(inventoryData)
      }

      // Save variants if any
      if (formData.variants.length > 0) {
        const variantsToInsert = formData.variants.map(variant => ({
          product_id: savedProduct.id,
          name: variant.name,
          sku: variant.sku,
          price_adjustment: variant.price || 0,
          cost_adjustment: 0,
          stock_quantity: variant.inventory_quantity || 0,
          color: variant.options?.color || null,
          size: variant.options?.size || null,
          reorder_level: 10,
          is_active: true,
          created_at: new Date().toISOString()
        }))

        await supabaseClient
          .from('bullrhun_product_variants')
          .insert(variantsToInsert)
      } else {
        // Create a default variant if no variants exist
        const defaultVariant = {
          product_id: savedProduct.id,
          name: 'Standard',
          sku: formData.sku || `${savedProduct.id}-STD`,
          price_adjustment: 0,
          cost_adjustment: 0,
          stock_quantity: formData.inventory_quantity || 0,
          color: null,
          size: null,
          reorder_level: 10,
          is_active: true,
          created_at: new Date().toISOString()
        }

        await supabaseClient
          .from('bullrhun_product_variants')
          .insert([defaultVariant])
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Error saving product')
      console.error('Error saving product:', error)
    } finally {
      setSaving(false)
    }
  }

  const getSubcategories = () => {
    switch (formData.category) {
      case 'Clothing': return clothingSubcategories
      case 'Accessories': return accessoriesSubcategories
      case 'Hats': return hatsSubcategories
      default: return []
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-gray-600">
            {productId ? 'Update product information' : 'Create a new product listing'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Basic product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product"
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select
                    value={formData.vendor_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSubcategories().length > 0 && (
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategory || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubcategories().map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Brand name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Add different colors, sizes, or other variations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={addVariant}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
              
              {formData.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeVariant(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
                      <Input
                        id={`variant-name-${index}`}
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="e.g., Small Red"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
                      <Input
                        id={`variant-sku-${index}`}
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        placeholder="Variant SKU"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`variant-color-${index}`}>Color</Label>
                      <Input
                        id={`variant-color-${index}`}
                        value={variant.color || ''}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        placeholder="e.g., Red, Blue"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`variant-size-${index}`}>Size</Label>
                      <Input
                        id={`variant-size-${index}`}
                        value={variant.size || ''}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        placeholder="e.g., S, M, L"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`variant-price-${index}`}>Price Adjustment</Label>
                      <Input
                        id={`variant-price-${index}`}
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500">Amount added to base price</p>
                    </div>
                    
                    <div>
                      <Label htmlFor={`variant-inventory-${index}`}>Inventory</Label>
                      <Input
                        id={`variant-inventory-${index}`}
                        type="number"
                        value={variant.inventory_quantity}
                        onChange={(e) => updateVariant(index, 'inventory_quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload product photos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                      >
                        <span>Upload files</span>
                        <input
                          id="images"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>

                {/* Image Gallery */}
                {formData.images.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={image.url}
                            alt={image.alt_text || `Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="mt-2">
                          <Input
                            placeholder="Alt text"
                            value={image.alt_text || ''}
                            onChange={(e) => {
                              const newImages = [...formData.images]
                              newImages[index].alt_text = e.target.value
                              setFormData(prev => ({ ...prev, images: newImages }))
                            }}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Product Variants</span>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </CardTitle>
              <CardDescription>
                Different versions of your product (size, color, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.variants.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No variants added yet. Click "Add Variant" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Variant {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <Label>Variant Name</Label>
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            placeholder="e.g., Small, Red"
                          />
                        </div>
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="Variant SKU"
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={variant.inventory_quantity}
                            onChange={(e) => updateVariant(index, 'inventory_quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="compare_price">Compare at Price</Label>
                <Input
                  id="compare_price"
                  type="number"
                  step="0.01"
                  value={formData.compare_price || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    compare_price: e.target.value ? parseFloat(e.target.value) || 0 : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="cost_per_item">Cost per Item</Label>
                <Input
                  id="cost_per_item"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_item || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cost_per_item: e.target.value ? parseFloat(e.target.value) || 0 : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="track_inventory"
                  checked={formData.track_inventory}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, track_inventory: !!checked }))}
                />
                <Label htmlFor="track_inventory">Track inventory</Label>
              </div>

              {formData.track_inventory && (
                <>
                  <div>
                    <Label htmlFor="inventory_quantity">Quantity</Label>
                    <Input
                      id="inventory_quantity"
                      type="number"
                      value={formData.inventory_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, inventory_quantity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_threshold">Low Stock Threshold</Label>
                    <Input
                      id="min_threshold"
                      type="number"
                      value={formData.min_threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_threshold: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_stock">Maximum Stock</Label>
                    <Input
                      id="max_stock"
                      type="number"
                      value={formData.max_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_stock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="w-3 h-3 ml-1" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_shipping"
                  checked={formData.requires_shipping}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_shipping: !!checked }))}
                />
                <Label htmlFor="requires_shipping">This product requires shipping</Label>
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    weight: e.target.value ? parseFloat(e.target.value) || 0 : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxable"
                  checked={formData.taxable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, taxable: !!checked }))}
                />
                <Label htmlFor="taxable">This product is taxable</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}