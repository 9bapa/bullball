'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  X, 
  Store,
  Package,
  MapPin,
  CheckCircle,
  Truck,
  Star,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react'

interface BecomeVendorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BecomeVendorModal({ isOpen, onClose }: BecomeVendorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-meme-dark border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-display font-bold text-white">
              Become a Vendor
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 text-center py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 rounded-xl p-6 border border-white/10">
            <div className="text-center">
              <Store className="w-12 h-12 text-meme-purple mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Start Your Print Shop
              </h3>
              <p className="text-gray-300 mb-4">
                Do you have a swag print shop? We will auto-route orders to vendors closest to buyers. Sign up today and start earning with the BullRhun marketplace!
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-meme-green/20 text-meme-green border-meme-green/30">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Zero Risk
                </Badge>
                <Badge className="bg-meme-blue/20 text-meme-blue border-meme-blue/30">
                  <Users className="w-4 h-4 mr-1" />
                  Growing Network
                </Badge>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => window.location.href = '/become-vendor'}
            className="w-full bg-gradient-to-r from-meme-purple to-meme-blue hover:from-meme-purple-dark hover:to-meme-blue-dark text-lg py-4"
          >
            <Store className="w-5 h-5 mr-2" />
            Go to Vendor Application Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}