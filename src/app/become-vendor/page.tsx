'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Store,
  Package,
  MapPin,
  CheckCircle,
  Truck,
  Star,
  Users,
  TrendingUp,
  Shield,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { SharedHeader } from '@/components/layout/shared-header'

export default function BecomeVendorPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    printShop: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would submit to your vendor API
      console.log('Submitting vendor application:', formData)
      
      // Show success message with auto-routing info
      alert(`🎉 Welcome to the BullRhun Vendor Program!\n\nThank you for your interest in becoming a vendor. We will review your application and route orders to print shop closest to your location.\n\n📦 Benefits:\n• Auto-routing of nearby customer orders\n• Print-on-demand service\n• Dashboard for order management\n• Integrated payments\n• No inventory needed`)
      
      // Reset form
      setFormData({
        businessName: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        printShop: false
      })
    } catch (error) {
      console.error('Error submitting vendor application:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Auto-Routing",
      description: "We'll automatically route customer orders to your nearest print shop",
      gradient: "from-meme-purple"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Print-on-Demand",
      description: "No inventory needed - we print and ship as orders come in",
      gradient: "from-meme-blue"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Dashboard Access",
      description: "Manage orders, track earnings, and update designs",
      gradient: "from-meme-green"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Zero Risk",
      description: "No upfront costs - you only pay when you make sales",
      gradient: "from-meme-orange"
    }
  ]

  return (
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
              <span className="text-white">Become a Vendor</span>
            </nav>

            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Become a <span className="text-meme-gradient">Print Shop Vendor</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Do you have a swag print shop? We will auto-route orders to vendors closest to buyers. Join our growing network of print partners and start earning with the BullRhun marketplace!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Join <span className="text-meme-gradient">BullRhun</span>?
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Transform your print shop into a crypto-powered business with our vendor program
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 text-center group hover:bg-white/10 transition-all">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-r ${benefit.gradient}/20 to-transparent group-hover:scale-110 transition-all duration-300`}>
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className={`text-${benefit.gradient === 'from-meme-purple' ? 'meme-purple' : benefit.gradient === 'from-meme-blue' ? 'meme-blue' : benefit.gradient === 'from-meme-green' ? 'meme-green' : 'meme-orange'}`}>
                        {benefit.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Vendor Badge */}
                <div className="bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 rounded-xl p-6 border border-white/10">
                  <div className="text-center">
                    <Building className="w-12 h-12 text-meme-purple mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Join Our Network
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge className="bg-meme-green/20 text-meme-green border-meme-green/30">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Zero Risk
                      </Badge>
                      <Badge className="bg-meme-blue/20 text-meme-blue border-meme-blue/30">
                        <Users className="w-4 h-4 mr-1" />
                        Growing Network
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300">
                      Connect with thousands of crypto enthusiasts looking for quality meme merchandise
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-meme-purple" />
                    Vendor Requirements
                  </h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-meme-green flex-shrink-0 mt-0.5" />
                      <p>Established print shop or print-on-demand service</p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-meme-green flex-shrink-0 mt-0.5" />
                      <p>Quality printing equipment and materials</p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-meme-green flex-shrink-0 mt-0.5" />
                      <p>Reliable shipping and fulfillment</p>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-meme-green flex-shrink-0 mt-0.5" />
                      <p>Business registration and tax compliance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Application Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Vendor Application</h2>
                  
                  {/* Business Information */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Business Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Business Name
                        </label>
                        <Input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Your print shop name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@yourshop.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white mb-2">
                          Business Address
                        </label>
                        <Input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="123 Main St, City, State 12345"
                          className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Business Description
                    </h4>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell us about your print shop, equipment, capabilities, and what makes you special..."
                      rows={6}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  {/* Print Shop Checkbox */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="printShop"
                        checked={formData.printShop}
                        onChange={(e) => setFormData(prev => ({ ...prev, printShop: e.target.checked }))}
                        className="rounded border-white/20 bg-white/10 text-meme-purple w-5 h-5"
                      />
                      <label htmlFor="printShop" className="text-sm text-gray-300">
                        I have an established print shop with equipment
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-meme-purple to-meme-blue hover:from-meme-purple-dark hover:to-meme-blue-dark text-lg py-4"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5" />
                        Apply to Become Vendor
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}