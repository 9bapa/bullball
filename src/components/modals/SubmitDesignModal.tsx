'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  X, 
  Send,
  Zap,
  TrendingUp,
  Coins,
  Image as ImageIcon,
  Palette,
  Star
} from 'lucide-react'

interface SubmitDesignModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubmitDesignModal({ isOpen, onClose }: SubmitDesignModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-meme-dark border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-display font-bold text-white">
              Submit Your Merch Design
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
          {/* Rewards Banner */}
          <div className="bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-8 h-8 text-meme-purple" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">Earn SOL with Every Sale!</h3>
                <p className="text-sm text-gray-300">Submit your fantastic meme swag design and earn crypto rewards when people buy your merch</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center">
                <Badge className="bg-meme-green/20 text-meme-green border-meme-green/30 w-full justify-center py-3">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  5% Royalty
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

          {/* CTA Button */}
          <Button 
            onClick={() => window.location.href = '/submit-design'}
            className="w-full bg-gradient-to-r from-meme-purple to-meme-blue hover:from-meme-purple-dark hover:to-meme-blue-dark text-lg py-4"
          >
            <Send className="w-5 h-5 mr-2" />
            Go to Design Submission Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}