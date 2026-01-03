'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDynamicWallet } from '@/components/wallet/DynamicWalletProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Building, 
  Upload,
  CheckCircle,
  AlertCircle,
  Save,
  Phone,
  Globe
} from 'lucide-react'
import { vendorService, UpdateVendorRequest } from '@/services/vendor.service'
import Link from 'next/link'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { AdminProtectedRoute } from '@/components/wallet/WalletConnectButton'

interface VendorFormData {
  name: string
  business_name: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  description: string
  logo_url: string
  commission_rate: string
  is_active: boolean
  is_featured: boolean
  wallet_address: string
  categories: string[]
}

const vendorCategories = [
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

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { connected, publicKey, isAdmin } = useDynamicWallet()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewLogo, setPreviewLogo] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<VendorFormData>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [vendorNotFound, setVendorNotFound] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string }>({ id: '' })
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    description: '',
    logo_url: '',
    commission_rate: '15',
    is_active: true,
    is_featured: false,
    wallet_address: '',
    categories: []
  })

  useEffect(() => {
    const resolveParams = async () => {
      const p = await params
      setResolvedParams({ id: p.id })
    }
    resolveParams()
  }, [])

  useEffect(() => {
    if (resolvedParams.id) {
      fetchVendor()
    }
  }, [resolvedParams.id])

  const fetchVendor = async () => {
    try {
      const vendor = await vendorService.getVendorById(resolvedParams.id)
      if (!vendor) {
        setVendorNotFound(true)
        return
      }

      setFormData({
        name: vendor.name || '',
        business_name: vendor.business_name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        website: vendor.website || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zip: vendor.zip_code || '',
        country: vendor.country || '',
        description: vendor.description || '',
        logo_url: vendor.logo_url || '',
        commission_rate: vendor.commission_rate?.toString() || '15',
        is_active: vendor.is_active ?? true,
        is_featured: vendor.is_featured ?? false,
        wallet_address: vendor.wallet_address || '',
        categories: vendor.categories || []
      })

      if (vendor.logo_url) {
        setPreviewLogo(vendor.logo_url)
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
      setVendorNotFound(true)
    }
  }

  useEffect(() => {
    // Auto-populate wallet address if wallet is connected
    if (publicKey && !formData.wallet_address) {
      const walletAddress = publicKey
      setFormData(prev => ({ ...prev, wallet_address: walletAddress }))
    }
  }, [publicKey, formData.wallet_address])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Create base64 fallback
      const reader2 = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader2.onloadend = () => resolve(reader2.result as string)
        reader2.readAsDataURL(file)
      })
      
      const base64Data = await base64Promise
      setFormData({ 
        ...formData, 
        logo_url: base64Data 
      })
      setPreviewLogo(base64Data)
    } catch (error) {
      console.error('Error uploading logo:', error)
      setErrors({ ...errors, logo_url: 'Failed to upload logo' })
    } finally {
      setUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<VendorFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Vendor name is required'
    if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setSubmitError('')

      const vendorData: UpdateVendorRequest = {
        name: formData.name.trim(),
        business_name: formData.business_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        zip: formData.zip.trim() || undefined,
        country: formData.country.trim(),
        description: formData.description.trim() || undefined,
        logo_url: formData.logo_url || undefined,
        commission_rate: parseFloat(formData.commission_rate) || 15,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        wallet_address: formData.wallet_address.trim() || undefined,
        categories: formData.categories
      }

      await vendorService.updateVendor(resolvedParams.id, vendorData)
      
      setSuccess(true)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        router.push('/admin')
      }, 3000)
    } catch (error) {
      console.error('Error updating vendor:', error)
      const errorMsg = `Failed to update vendor: ${error instanceof Error ? error.message : 'Unknown error'}`
      setErrorMessage(errorMsg)
      setShowErrorModal(true)
      setSubmitError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof VendorFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (vendorNotFound) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
          <SharedHeader />
          <div className="relative mt-10">
            <div className="container mx-auto px-4 py-8 md:py-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Admin
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-none mb-6">
                      Vendor Not Found
                    </h1>
                    <p className="text-gray-400">The vendor you're trying to edit doesn't exist.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SharedFooter />
        </div>
      </AdminProtectedRoute>
    )
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
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Admin
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-none mb-6">
                    Edit Vendor
                  </h1>
                  <p className="text-gray-400">Update vendor information</p>
                </div>
              </div>

              {success && showSuccessModal && (
                <Card className="border-emerald-500/50 bg-emerald-500/10 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-emerald-400 mb-2">✓</div>
                    <h3 className="text-lg font-medium text-white mb-2">Vendor Updated Successfully!</h3>
                    <p className="text-gray-400">Redirecting to admin dashboard...</p>
                  </CardContent>
                </Card>
              )}

              {submitError && showErrorModal && (
                <Card className="border-red-500/50 bg-red-500/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div>
                        <h3 className="text-lg font-medium text-white mb-1">Error</h3>
                        <p className="text-gray-400">{errorMessage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Vendor Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update vendor's details. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="logo_url" className="text-sm font-medium text-gray-300">
                        Logo
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {previewLogo ? (
                            <img 
                              src={previewLogo} 
                              alt="Logo preview" 
                              className="h-20 w-20 rounded-lg object-cover border border-slate-600/50"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-600/50 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <input
                            type="file"
                            id="logo_url"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploading}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Upload vendor logo</p>
                          <p className="text-xs text-gray-500">Recommended: 200x200px, Max 2MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                          Vendor Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter vendor name"
                          className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 ${
                            errors.name ? 'border-red-500/50 focus:border-red-500/50' : ''
                          }`}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business_name" className="text-sm font-medium text-gray-300">
                          Business Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="business_name"
                          value={formData.business_name}
                          onChange={(e) => handleInputChange('business_name', e.target.value)}
                          placeholder="Enter business name"
                          className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 ${
                            errors.business_name ? 'border-red-500/50 focus:border-red-500/50' : ''
                          }`}
                        />
                        {errors.business_name && (
                          <p className="text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.business_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                          Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="vendor@example.com"
                          className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 ${
                            errors.email ? 'border-red-500/50 focus:border-red-500/50' : ''
                          }`}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wallet_address" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          Solana Wallet Address
                          {connected && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                              Auto-filled
                            </Badge>
                          )}
                        </Label>
                        <Input
                          id="wallet_address"
                          value={formData.wallet_address}
                          onChange={(e) => handleInputChange('wallet_address', e.target.value)}
                          placeholder="Enter Solana wallet address"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium text-gray-300">
                        Website
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://example.com"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-300">Address Information</Label>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Input
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Street Address"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="City"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            placeholder="State/Province"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={formData.zip}
                            onChange={(e) => handleInputChange('zip', e.target.value)}
                            placeholder="ZIP/Postal Code"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-medium text-gray-300">
                            Country <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            placeholder="United States"
                            className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 ${
                              errors.country ? 'border-red-500/50 focus:border-red-500/50' : ''
                            }`}
                          />
                          {errors.country && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter vendor description..."
                        rows={4}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      />
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-300">
                          Categories (Select all that apply)
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (formData.categories.length === vendorCategories.length) {
                              handleInputChange('categories', [])
                            } else {
                              handleInputChange('categories', vendorCategories)
                            }
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          {formData.categories.length === vendorCategories.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {vendorCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              checked={formData.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('categories', [...formData.categories, category])
                                } else {
                                  handleInputChange('categories', formData.categories.filter(c => c !== category))
                                }
                              }}
                              className="h-4 w-4 text-emerald-500 border-white/20 rounded focus:ring-emerald-500/20 bg-white/10"
                            />
                            <Label 
                              htmlFor={`category-${category}`} 
                              className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs text-gray-400">Selected:</span>
                          {formData.categories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Commission Rate */}
                    <div className="space-y-2">
                      <Label htmlFor="commission_rate" className="text-sm font-medium text-gray-300">
                        Commission Rate (%)
                      </Label>
                      <Input
                        id="commission_rate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.commission_rate}
                        onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                        placeholder="15"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      />
                      <p className="text-xs text-gray-500">Default commission rate for this vendor's sales</p>
                    </div>

                    {/* Status Options */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="h-4 w-4 text-emerald-500 border-white/20 rounded focus:ring-emerald-500/20"
                        />
                        <Label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                          Active Vendor
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={formData.is_featured}
                          onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                          className="h-4 w-4 text-yellow-500 border-white/20 rounded focus:ring-yellow-500/20"
                        />
                        <Label htmlFor="is_featured" className="text-sm font-medium text-gray-300">
                          Featured Vendor
                        </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                      <Link href="/admin">
                        <Button variant="outline" className="border-white/20 text-gray-400 hover:text-white">
                          Cancel
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        disabled={loading || uploading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {loading ? 'Updating Vendor...' : 'Update Vendor'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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
                  <h3 className="text-xl font-bold text-white mb-2">Vendor Updated Successfully!</h3>
                  <p className="text-gray-400">
                    The vendor "{formData.name}" has been successfully updated.
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
                  <h3 className="text-xl font-bold text-white mb-2">Error Updating Vendor</h3>
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