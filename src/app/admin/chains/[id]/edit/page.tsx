'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Link as LinkIcon, 
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X
} from 'lucide-react'
import { chainService, UpdateChainRequest, Chain } from '@/services/chain.service'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

interface ChainFormData {
  name: string
  symbol: string
  is_active: boolean
}

export default function EditChainPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ChainFormData>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [chainNotFound, setChainNotFound] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string }>({ id: '' })

  const [formData, setFormData] = useState<ChainFormData>({
    name: '',
    symbol: '',
    is_active: true
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
      fetchChain()
    }
  }, [resolvedParams.id])

  const fetchChain = async () => {
    try {
      const chain = await chainService.getChainById(parseInt(resolvedParams.id))
      if (!chain) {
        setChainNotFound(true)
        return
      }

      setFormData({
        name: chain.name || '',
        symbol: chain.symbol || '',
        is_active: chain.is_active ?? true
      })
    } catch (error) {
      console.error('Error fetching chain:', error)
      setChainNotFound(true)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ChainFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Chain name is required'
    }
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required'
    }
    if (formData.symbol.length > 10) {
      newErrors.symbol = 'Symbol must be 10 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setSubmitError('')

      const chainData: UpdateChainRequest = {
        name: formData.name.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        is_active: formData.is_active
      }

      await chainService.updateChain(parseInt(resolvedParams.id), chainData)
      
      setSuccess(true)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        router.push('/admin')
      }, 3000)
    } catch (error) {
      console.error('Error updating chain:', error)
      const errorMsg = `Failed to update chain: ${error instanceof Error ? error.message : 'Unknown error'}`
      setErrorMessage(errorMsg)
      setShowErrorModal(true)
      setSubmitError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ChainFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (chainNotFound) {
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
                      <h2 className="text-2xl font-bold mb-2">Chain Not Found</h2>
                      <p className="text-muted-foreground mb-6">
                        The chain you're trying to edit doesn't exist.
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
                        Edit Chain
                      </span>
                    </h1>
                    <p className="text-muted-foreground">Update chain information</p>
                  </div>
                </div>

                {success && (
                  <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="p-6 text-center">
                      <div className="text-green-500 mb-2">✓</div>
                      <h3 className="text-lg font-medium mb-2">Chain Updated Successfully!</h3>
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
                        <LinkIcon className="h-5 w-5 text-primary" />
                        Chain Information
                      </CardTitle>
                      <CardDescription>
                        Update chain details. All fields marked with * are required.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Chain Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="e.g., Ethereum, Solana"
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
                            <Label htmlFor="symbol">
                              Symbol <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="symbol"
                              value={formData.symbol}
                              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                              placeholder="e.g., ETH, SOL"
                              maxLength={10}
                              className={errors.symbol ? 'border-red-500' : ''}
                            />
                            {errors.symbol && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.symbol}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Maximum 10 characters. Will be auto-capitalized.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="is_active"
                              checked={formData.is_active}
                              onChange={(e) => handleInputChange('is_active', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium">
                              Active Chain
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground ml-7">
                            When enabled, this chain will be available for use in platform
                          </p>
                        </div>

                        <div className="flex justify-end gap-3">
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
                            {loading ? 'Updating Chain...' : 'Update Chain'}
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
                <h3 className="text-xl font-bold mb-2">Chain Updated Successfully!</h3>
                <p className="text-muted-foreground">
                  The chain "{formData.name}" has been successfully updated.
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
                <h3 className="text-xl font-bold mb-2">Error Updating Chain</h3>
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
