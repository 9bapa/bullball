'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Send,
  Zap,
  TrendingUp,
  Coins,
  Image as ImageIcon,
  Palette,
  Star,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { SharedHeader } from '@/components/layout/shared-header'
import { BottomNav } from '@/components/layout/mobile-nav'
import { SharedFooter } from '@/components/layout/shared-footer'


export default function SubmitDesignPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    image: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would submit to your backend
      console.log('Submitting design:', formData)
      
      // Show success message with SOL reward info
      alert(`🎉 Fantastic meme design! If accepted, you'll earn SOL with each sale!\n\nYour design "${formData.title}" has been submitted for review. Our team will evaluate it and you'll earn crypto rewards for every purchase.`)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        image: null
      })
      setPreviewUrl('')
    } catch (error) {
      console.error('Error submitting design:', error)
      alert('Error submitting design. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-meme-dark text-white">
      <SharedHeader />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-white">Submit Design</span>
            </nav>

            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Submit Your <span className="text-meme-gradient">Meme Design</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Have a fantastic meme, swag design idea? Submit it and earn SOL with every sale! Join our community of crypto creators and designers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Benefits & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* SOL Rewards Banner */}
              <div className="bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="w-8 h-8 text-meme-purple" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Earn SOL with Every Sale!</h3>
                    <p className="text-sm text-gray-300">Submit your fantastic meme swag design and earn crypto rewards when people buy your merch</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-center">
                    <Badge className="bg-meme-green/20 text-meme-green border-meme-green/30 w-full justify-center py-3">
                      <TrendingUp className="w-5 h-5 mr-1" />
                      50% Royalty
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-meme-blue/20 text-meme-blue border-meme-blue/30 w-full justify-center py-3">
                      <Star className="w-5 h-5 mr-1" />
                      Designer Badge
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-meme-orange/20 text-meme-orange border-meme-orange/30 w-full justify-center py-3">
                      <Zap className="w-5 h-5 mr-1" />
                      Instant Payouts
                    </Badge>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-meme-purple" />
                  How It Works
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-meme-purple/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <p>Submit your best meme design idea</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-meme-purple/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <p>Our team reviews and approves designs</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-meme-purple/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <p>Get listed in our marketplace</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-meme-purple/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <p>Earn SOL with every purchase</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Design Submission Form</h2>
                
                {/* Design Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-3">
                    <ImageIcon className="w-5 h-5 mr-2 inline" />
                    Design Image
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Design preview" 
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        <Upload className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg mb-4">Click to upload your design</p>
                        <p className="text-sm text-gray-500">High-quality images work best (PNG, JPG)</p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="design-upload"
                    />
                    <label 
                      htmlFor="design-upload"
                      className="cursor-pointer inline-flex items-center px-6 py-3 bg-meme-purple text-white rounded-lg hover:bg-meme-purple/80 transition-colors"
                    >
                      <Palette className="w-5 h-5 mr-2" />
                      Choose Design File
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Design Title
                    </label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your design name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="t-shirt">T-Shirt</option>
                      <option value="hoodie">Hoodie</option>
                      <option value="hat">Hat/Cap</option>
                      <option value="mug">Mug</option>
                      <option value="sticker">Sticker</option>
                      <option value="poster">Poster</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    <Palette className="w-5 h-5 mr-2 inline" />
                    Design Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your meme design, what makes it special, who would love it..."
                    rows={6}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-white mb-2">
                    <Coins className="w-5 h-5 mr-2 inline" />
                    Suggested Price (SOL)
                  </label>
                  <Input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.1"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Submit Button */}
                {/* <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-meme-purple to-meme-blue hover:from-meme-purple-dark hover:to-meme-blue-dark text-lg py-4"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting Design...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5" />
                      Submit Your Design
                    </div>
                  )}
                </Button> */}
                             <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-purple-400">Design Submissions Status</h4>
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🔒</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-2">$1,000,000</p>
                    <p className="text-sm text-gray-300 mb-4">Market Cap Milestone for Design Submissions</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-yellow-400">Locked</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Design submissions will open when $BULL token reaches $1M market cap. Submit your designs and be ready for the drop!
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
    <BottomNav activeTab="design" />
    <SharedFooter />
    </>
  )
}