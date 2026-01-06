'use client';

import { useState, useEffect, use } from 'react';
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { cryptoService } from '@/services/crypto.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useUserContext } from '@/context/userContext';

export default function OrderCheckoutPage({ params }: { params: Promise<{ order_id: string }> }) {
  const { connected, publicKey } = useUserContext();
  const [order, setOrder] = useState<any>(null);
  const [paymentAddress, setPaymentAddress] = useState('');
  const [amountSol, setAmountSol] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [solConversion, setSolConversion] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { clearCart } = useCartStore();
  const router = useRouter();

  // Unwrap params using React.use()
  const resolvedParams = use(params);

  // Load existing order on component mount
  useEffect(() => {
    loadExistingOrder(resolvedParams.order_id);
  }, [resolvedParams.order_id]);

  const processPayment = async (orderId: string) => {
    if (processingPayment) return;
    
    setProcessingPayment(true);
    try {
      const response = await fetch('/api/orders/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(`Payment processed successfully! 💰`, {
            description: `Dev fee: ${result.devFee} SOL | Platform: ${result.platformAmount} SOL`
          });
          console.log('Payment processed:', result);
        } else {
          toast.error('Payment processing failed');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const loadExistingOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/orders/payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.order) {
          setOrder(result.order);
          setPaymentAddress(result.order.solana_payment_address || '');
          setAmountSol(result.order.payment_amount_sol || 0);
          
          // Load SOL conversion
          if (result.order.total_amount) {
            await loadSOLConversion(result.order.total_amount);
          }
          
          // Generate QR code
          if (result.order.solana_payment_address) {
            generateQRCode(result.order.solana_payment_address).then(qrDataUrl => {
              setQrCodeUrl(qrDataUrl);
            }).catch(error => {
              console.error('Error generating QR code:', error);
            });
          }
        }
      } else {
        toast.error('Order not found');
        router.push('/merch');
      }
    } catch (error) {
      console.error('Error loading existing order:', error);
      toast.error('Failed to load order');
      router.push('/merch');
    } finally {
      setLoading(false);
    }
  };

  const loadSOLConversion = async (usdAmount: number) => {
    setLoadingPrice(true);
    try {
      const conversion = await cryptoService.convertUSDToSOL(usdAmount);
      setSolConversion(conversion);
    } catch (error) {
      console.error('Error loading SOL conversion:', error);
      toast.error('Failed to load SOL price');
    } finally {
      setLoadingPrice(false);
    }
  };

  // Check payment status periodically
  useEffect(() => {
    if (order && !paymentConfirmed) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/orders/payment-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.order) {
              // Check if payment was received but not yet processed
              if (result.order && result.order.status === 'pending' && !processingPayment) {
                // Check if payment address has sufficient balance
                const paymentAddress = result.order.solana_payment_address;
                let requiredAmount = result.order.payment_amount_sol;
                
                // Fallback: use total_amount if payment_amount_sol is null (for existing orders)
                if (!requiredAmount && result.order.total_amount) {
                  // Convert USD to SOL for existing orders
                  if (solConversion) {
                    requiredAmount = result.order.total_amount / solConversion.exchangeRate;
                    console.log('Using fallback conversion:', { 
                      totalAmount: result.order.total_amount, 
                      exchangeRate: solConversion.exchangeRate,
                      calculatedRequiredAmount: requiredAmount 
                    });
                  } else {
                    console.error('Cannot calculate required amount - missing conversion data');
                    return;
                  }
                }
                
                console.log('Checking balance:', { paymentAddress, requiredAmount });
                
                if (!paymentAddress || !requiredAmount) {
                  console.error('Missing payment data:', { paymentAddress, requiredAmount });
                  return;
                }
                
                try {
                  const balanceResponse = await fetch('/api/orders/check-balance', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                      paymentAddress,
                      requiredAmount 
                    }),
                  });

                  if (balanceResponse.ok) {
                    const balanceResult = await balanceResponse.json();
                    if (balanceResult.sufficient) {
                      // Payment received, process it
                      await processPayment(result.order.id);
                    }
                  }
                } catch (balanceError) {
                  console.error('Error checking balance:', balanceError);
                }
              }
              
              // Check if order is now marked as paid
              if (result.order.status === 'paid') {
                setPaymentConfirmed(true);
                toast.success('Payment confirmed! 🎉');
                // Clear cart and redirect to success page
                setTimeout(() => {
                  clearCart();
                  router.push('/merch/success');
                }, 2000);
              }
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [order, paymentConfirmed, router, clearCart]);

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      const solanaUrl = `solana:${text}`;
      return await QRCode.toDataURL(solanaUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI0OCIgeT0iNDgiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSJibGFjayIvPgo8dGV4dCB4PSIxMjgiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiPlNPTDwvdGV4dD4KPC9zdmc+';
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
    setCopiedAddress(true);
    toast.success('Payment address copied to clipboard');
    setTimeout(() => setCopiedAddress(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
        <SharedHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-lg">Loading order...</div>
        </div>
        <SharedFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
        <SharedHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white text-2xl mb-4">Order not found</h1>
            <Link href="/merch">
              <Button className="bg-purple-600 hover:bg-purple-700">Return to Store</Button>
            </Link>
          </div>
        </div>
        <SharedFooter />
      </div>
    );
  }

  // Validate order structure
  if (!order.bullrhun_order_items || !Array.isArray(order.bullrhun_order_items)) {
    console.error('Order items not found or invalid:', order);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
        <SharedHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white text-2xl mb-4">Order data incomplete</h1>
            <p className="text-gray-300 mb-4">Unable to load order items. Please contact support.</p>
            <Link href="/merch">
              <Button className="bg-purple-600 hover:bg-purple-700">Return to Store</Button>
            </Link>
          </div>
        </div>
        <SharedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 mb-10">
      <SharedHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto mt-10">
            {/* Header */}
            <div className="mb-8">
              <Link href="/merch/cart">
                <Button variant="outline" className="border-slate-600 text-gray-300 hover:text-white mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              
              <div className="text-center mb-6">
                <h1 className="text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
                    💰 COMPLETE PAYMENT 💰
                  </span>
                </h1>
                <p className="text-lg text-gray-300">
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                    Send SOL to complete your order
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Content */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Complete Your Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h3 className="text-purple-400 font-semibold mb-2">🔒 Secure Solana Payment</h3>
                      <p className="text-gray-300 text-sm">
                        Send the exact amount in SOL to the address below. Your order will be confirmed automatically once payment is detected.
                      </p>
                    </div>

                    {/* Payment Amount */}
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Amount to Pay</p>
                      {loadingPrice ? (
                        <div className="animate-pulse">
                          <div className="h-10 bg-slate-600 rounded mb-2"></div>
                          <div className="h-6 bg-slate-600 rounded"></div>
                        </div>
                      ) : solConversion ? (
                        <>
                          <div className="text-3xl font-bold text-purple-400 mb-2">
                            {cryptoService.formatSOLAmount(solConversion.solAmount)}
                          </div>
                          <p className="text-gray-500 text-sm mb-1">
                            Equivalent to {cryptoService.formatUSDAmount(solConversion.usdAmount)}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Exchange Rate: 1 SOL = ${solConversion.exchangeRate.toFixed(2)} USD
                          </p>
                        </>
                      ) : (
                        <div className="text-gray-400">
                          Loading conversion rate...
                        </div>
                      )}
                    </div>

                    {/* Payment Address */}
                    <div>
                      <Label className="text-gray-300 mb-2 block">Payment Address</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={paymentAddress}
                          readOnly
                          className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          onClick={copyAddress}
                          className="border-slate-600 text-gray-300 hover:text-white"
                        >
                          {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      {/* QR Code */}
                      {qrCodeUrl && (
                        <div className="flex justify-center mt-4 mb-4">
                          <div className="bg-white p-4 rounded-lg">
                            <img 
                              src={qrCodeUrl} 
                              alt="Payment QR Code"
                              className="w-32 h-32"
                            />
                          </div>
                        </div>
                      )}
                      
                      <p className="text-gray-500 text-xs mt-2">
                        This address is unique to your order. Do not send funds from exchanges.
                      </p>

                      {/* Payment Status */}
                      {paymentConfirmed ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                          <h4 className="text-green-400 font-semibold mb-2 flex items-center">
                            <Check className="w-4 h-4 mr-2" />
                            Payment Confirmed!
                          </h4>
                          <p className="text-gray-300 text-sm">
                            Your payment has been received and order is being processed. Redirecting to order confirmation...
                          </p>
                        </div>
                      ) : (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                          <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                            <div className="w-4 h-4 mr-2 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            Waiting for Payment
                          </h4>
                          <p className="text-gray-300 text-sm">
                            Send the exact SOL amount to the address above. Payment confirmation usually takes 1-3 minutes.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h4 className="text-orange-400 font-semibold mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Important Payment Instructions
                      </h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Send exactly {solConversion ? cryptoService.formatSOLAmount(solConversion.solAmount) : '...'} - no more, no less</li>
                        <li>• Use a Solana wallet (Phantom, Solflare, etc.)</li>
                        <li>• Payment confirmation may take 1-3 minutes</li>
                        <li>• Save your transaction ID for your records</li>
                        <li>• Current rate: 1 SOL = ${solConversion?.exchangeRate?.toFixed(2) || '...'} USD</li>
                      </ul>
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={() => loadSOLConversion(order.total_amount)}
                          disabled={loadingPrice}
                          variant="outline"
                          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 flex-1"
                        >
                          {loadingPrice ? 'Updating...' : '🔄 Refresh Price'}
                        </Button>
                        
                        <Button
                          onClick={() => processPayment(order.id)}
                          disabled={processingPayment}
                          variant="outline"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 flex-1"
                        >
                          {processingPayment ? 'Processing...' : '💰 Process Payment'}
                        </Button>
                      </div>
                    </div>

                    {/* Order Status */}
                    <div className="text-center">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-2">
                        Awaiting Payment
                      </Badge>
                      <p className="text-gray-400 text-sm">
                        Order #{order.order_number}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items Summary */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {order.bullrhun_order_items?.map((item: any) => {
                        // Use the correct nested structure from API response
                        const product = item.bullrhun_products;
                        const variant = item.bullrhun_product_variants;
                        
                        // Add null checks for product and its properties
                        if (!product) {
                          return (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {item.quantity} × Product not found
                              </span>
                              <span className="text-white">$0.00</span>
                            </div>
                          );
                        }
                        
                        const basePrice = product.base_price || 0;
                        const priceAdjustment = variant?.price_adjustment || 0;
                        const unitPrice = basePrice + priceAdjustment;
                        const totalPrice = unitPrice * item.quantity;
                        const productName = product.name || 'Unknown Product';
                        
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {item.quantity} × {productName}
                            </span>
                            <span className="text-white">${totalPrice.toFixed(2)}</span>
                          </div>
                        );
                      }) || <div className="text-gray-400">No items found</div>}
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">${order.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shipping</span>
                        <span className="text-white">
                          {order.shipping_cost === 0 ? (
                            <span className="text-green-400">FREE</span>
                          ) : (
                            `$${order.shipping_cost?.toFixed(2) || '0.00'}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">${order.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-purple-400">${order.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>

                    {/* Shipping Info */}
                    <div className="pt-4 border-t border-slate-600">
                      <h4 className="text-white font-semibold mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-300">
                        <p>{order.shipping_address}</p>
                        <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                        <p>{order.shipping_country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
    </div>
  );
}