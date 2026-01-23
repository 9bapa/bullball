'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Copy, CheckCircle, Wallet, ExternalLink, RefreshCw, ArrowRight, Sparkles, Clock } from 'lucide-react'

interface PaymentAddressProps {
  address: string
  amount: number
  status: 'pending' | 'paid' | 'confirmed' | 'failed'
  orderId?: string
  onRefresh?: () => void
  onStatusChange?: (status: 'pending' | 'paid' | 'confirmed' | 'failed') => void
}

export function PaymentAddress({ 
  address, 
  amount, 
  status, 
  orderId,
  onRefresh,
  onStatusChange 
}: PaymentAddressProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!address || !amount || status !== 'pending') return

    try {
      const response = await fetch('/api/orders/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentAddress: address, requiredAmount: amount })
      })

      const result = await response.json()

      if (result.currentBalance !== undefined) {
        setCurrentBalance(result.currentBalance)
      }

      if (result.sufficient && orderId) {
        setIsPolling(false)
        setIsProcessing(true)

        try {
          const processResponse = await fetch('/api/orders/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          })

          const processResult = await processResponse.json()

          if (processResult.success) {
            setTransactionSignature(processResult.signature || processResult.transactionHash)
            onStatusChange?.('confirmed')
          } else {
            onStatusChange?.('failed')
          }
        } catch (error) {
          console.error('Error processing payment:', error)
          onStatusChange?.('failed')
        } finally {
          setIsProcessing(false)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }, [address, amount, status, orderId, onStatusChange])

  // Poll for payment status
  useEffect(() => {
    if (status === 'pending' && address && amount) {
      setIsPolling(true)
      const interval = setInterval(() => {
        checkPaymentStatus()
      }, 8000)

      checkPaymentStatus()

      return () => {
        clearInterval(interval)
        setIsPolling(false)
      }
    }
  }, [status, address, amount, checkPaymentStatus])

  // Generate QR code URL
  useEffect(() => {
    if (address) {
      const qrData = `solana:${address}`
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`)
    }
  }, [address])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const copyTransactionSignature = async () => {
    if (transactionSignature) {
      try {
        await navigator.clipboard.writeText(transactionSignature)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy transaction signature:', err)
      }
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'paid':
        return <Wallet className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <Wallet className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Waiting for Payment'
      case 'paid':
        return 'Payment Detected'
      case 'confirmed':
        return 'Payment Confirmed'
      case 'failed':
        return 'Payment Failed'
      default:
        return 'Unknown Status'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solana Payment
          </div>
          {status !== 'pending' && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">{getStatusText()}</p>
              <p className="text-sm opacity-75">
                {status === 'pending' && 'Send SOL to the address below'}
                {status === 'paid' && 'Payment detected, confirming...'}
                {status === 'confirmed' && 'Payment confirmed successfully!'}
                {status === 'failed' && 'Payment failed. Please try again.'}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {status.toUpperCase()}
          </Badge>
        </div>

        {/* Balance Progress */}
        {status === 'pending' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isPolling ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-pulse" />
                    Checking payment...
                  </span>
                ) : (
                  'Payment Progress'
                )}
              </span>
              <span className="font-medium">
                {currentBalance.toFixed(3)} / {typeof amount === 'number' ? amount.toFixed(3) : amount} SOL
              </span>
            </div>
            <Progress 
              value={(currentBalance / (typeof amount === 'number' ? amount : parseFloat(amount))) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-800 font-medium">Processing payment...</span>
          </div>
        )}

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code"
                className="w-48 h-48 border-2 border-gray-300 rounded-lg"
                onError={(e) => {
                  // Fallback QR code generation
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    canvas.width = 200
                    canvas.height = 200
                    ctx.fillStyle = '#000'
                    ctx.fillRect(0, 0, 200, 200)
                    ctx.fillStyle = '#fff'
                    ctx.font = '12px monospace'
                    ctx.fillText('QR Code Error', 50, 100)
                    ctx.fillText(address.slice(0, 20) + '...', 30, 120)
                    e.currentTarget.src = canvas.toDataURL()
                  }
                }}
              />
              {status === 'confirmed' && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90 rounded-lg">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Address */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Address</p>
              <p className="text-xs text-muted-foreground">Send exactly {typeof amount === 'number' ? amount.toFixed(3) : amount} SOL</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          
          <div className="relative">
            <Input
              value={address}
              readOnly
              className="pr-20 font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {address.slice(0, 8)}...{address.slice(-8)}
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Confirmed Details */}
        {status === 'confirmed' && transactionSignature && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800">Payment Confirmed!</h3>
                <p className="text-sm text-green-700">Your order has been successfully processed</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Transaction Signature</span>
              </div>
              <div className="relative">
                <Input
                  value={transactionSignature}
                  readOnly
                  className="font-mono text-xs bg-white border-green-200"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTransactionSignature}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-xs gap-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2 border-green-300 text-green-700 hover:bg-green-100"
                asChild
              >
                <a href={`https://solscan.io/tx/${transactionSignature}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View on Solscan
                </a>
              </Button>
              <Button 
                className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                asChild
              >
                <a href="/profile">
                  <ArrowRight className="h-4 w-4" />
                  View Order
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">How to Pay:</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Copy the Solana address above or scan the QR code</li>
            <li>Open your Solana wallet (Phantom, Solflare, etc.)</li>
            <li>Send exactly <strong>{typeof amount === 'number' ? amount.toFixed(3) : amount} SOL</strong> to the payment address</li>
            <li>Payment will be automatically detected and confirmed</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Send the exact amount. Partial payments cannot be processed.
            </p>
          </div>
        </div>

        {/* Wallet Links */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Don't have a Solana wallet?</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Phantom
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Solflare
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}