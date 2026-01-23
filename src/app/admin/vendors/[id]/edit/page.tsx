'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/context/userContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Building2, 
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  Globe,
  X
} from 'lucide-react'
import { vendorService, UpdateVendorRequest, Vendor } from '@/services/vendor.service'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

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
  const { connected, publicKey } = useUserContext()
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string)
      }
      reader.readAsDataURL(file)

      setFormData(prev => ({
        ...prev,
        logo_url: reader.result as string
      }))
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (vendorNotFound) {
    return (
      <>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
          <Header />

          <main className="flex-1">
            <section className="relative py-8 lg:py-12 overflow-hidden">
              <div className="container relative px-4 max-w-4xl mx-auto">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Link href="/admin">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Admin
                      </Button>
                    </Link>
                  </div>

                  <Card className="border-red-500/30">
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
                      <p className="text-muted-foreground mb-6">
                        The vendor you're trying to edit doesn't exist.
                      </p>
                      <Link href="/admin">
                        <Button>Back to Admin Dashboard</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </main>

          <Footer />
          <MobileBottomNav />
        </div>
      </>
    )
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

            <div className="container relative px-4 max-w-4xl mx-auto">
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
                        Edit Vendor
                      </span>
                    </h1>
                    <p className="text-muted-foreground">Update vendor information</p>
                  </div>
                </div>

                {success && (
                  <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="p-6 text-center">
                      <div className="text-green-500 mb-2">✓</div>
                      <h3 className="text-lg font-medium mb-2">Vendor Updated Successfully!</h3>
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
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Vendor Information
                      </CardTitle>
                      <CardDescription>
                        Update vendor details. All fields marked with * are required.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="logo_url">
                            Logo
                          </Label>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {previewLogo ? (
                                <img 
                                  src={previewLogo} 
                                  alt="Logo preview" 
                                  className="h-20 w-20 rounded-lg object-cover border border-border"
                                />
                              ) : (
                                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                                  <Upload className="h-6 w-6 text-muted-foreground" />
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
                              <p className="text-sm text-muted-foreground">Upload vendor logo</p>
                              <p className="text-xs text-muted-foreground">Recommended: 200x200px, Max 2MB</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Vendor Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter vendor name"
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
                            <Label htmlFor="business_name">
                              Business Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="business_name"
                              value={formData.business_name}
                              onChange={(e) => handleInputChange('business_name', e.target.value)}
                              placeholder="Enter business name"
                              className={errors.business_name ? 'border-red-500' : ''}
                            />
                            {errors.business_name && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.business_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="vendor@example.com"
                              className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.email}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="wallet_address" className="flex items-center gap-2">
                              Solana Wallet Address
                              {connected && (
                                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                                  Auto-filled
                                </Badge>
                              )}
                            </Label>
                            <Input
                              id="wallet_address"
                              value={formData.wallet_address}
                              onChange={(e) => handleInputChange('wallet_address', e.target.value)}
                              placeholder="Enter Solana wallet address"
                            />
                            {connected && (
                              <p className="text-xs text-primary">
                                Wallet address automatically populated from connected wallet
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            Phone
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">
                            Website
                          </Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              value={formData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              placeholder="https://example.com"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Address Information</Label>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                              <Input
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="Street Address"
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="City"
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={formData.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                                placeholder="State/Province"
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={formData.zip}
                                onChange={(e) => handleInputChange('zip', e.target.value)}
                                placeholder="ZIP/Postal Code"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">
                                Country <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                placeholder="United States"
                                className={errors.country ? 'border-red-500' : ''}
                              />
                              {errors.country && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.country}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter vendor description..."
                            rows={4}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>
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
                              className="text-xs text-primary hover:text-primary/80"
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
                                  className="h-4 w-4"
                                />
                                <Label 
                                  htmlFor={`category-${category}`} 
                                  className="text-sm cursor-pointer hover:foreground transition-colors"
                                >
                                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {formData.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="text-xs text-muted-foreground">Selected:</span>
                              {formData.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="commission_rate">
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
                          />
                          <p className="text-xs text-muted-foreground">Default commission rate for this vendor's sales</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="is_active"
                              checked={formData.is_active}
                              onChange={(e) => handleInputChange('is_active', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium">
                              Active Vendor
                            </Label>
                          </div>

                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="is_featured"
                              checked={formData.is_featured}
                              onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="is_featured" className="text-sm font-medium">
                              Featured Vendor
                            </Label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Link href="/admin">
                            <Button variant="outline">
                              Cancel
                            </Button>
                          </Link>
                          <Button
                            type="submit"
                            disabled={loading || uploading}
                          >
                            {loading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {loading ? 'Updating Vendor...' : 'Update Vendor'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
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
                <h3 className="text-xl font-bold mb-2">Vendor Updated Successfully!</h3>
                <p className="text-muted-foreground">
                  The vendor "{formData.name}" has been successfully updated.
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
                <h3 className="text-xl font-bold mb-2">Error Updating Vendor</h3>
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
