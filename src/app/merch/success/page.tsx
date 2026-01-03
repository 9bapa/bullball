'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { Check, Truck, Package, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      <SharedHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-white">Order Confirmed! 🎉</CardTitle>
                <p className="text-gray-300 mt-2">
                  Your payment has been received and your order is now being processed.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Status */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-green-400 font-semibold mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Order Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-gray-300">Payment Confirmed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-gray-300">Processing (Current)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-gray-400">Shipped</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-gray-400">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* What's Next */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    What's Next?
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Order confirmation email sent to your registered email</li>
                    <li>• Order processing typically takes 1-2 business days</li>
                    <li>• You'll receive tracking information once shipped</li>
                    <li>• Estimated delivery: 3-7 business days after shipping</li>
                  </ul>
                </div>

                {/* Support */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-purple-400 font-semibold mb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Need Help?
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Our customer support team is here to help with any questions about your order.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                      onClick={() => window.location.href = 'mailto:support@bullrhun.com'}
                    >
                      Email Support
                    </Button>
                    <Button 
                      onClick={() => router.push('/merch')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => window.print()}
                    className="border-gray-600 text-gray-300 hover:bg-gray-600/10"
                  >
                    Print Receipt
                  </Button>
                  <Button 
                    onClick={() => router.push('/merch')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Back to Shop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  )
}