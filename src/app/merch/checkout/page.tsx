'use client';

import { useState, useEffect } from 'react';
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { cryptoService } from '@/services/crypto.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple QR Code Generator
const generateQRCode = (text: string): string => {
  const size = 8;
  const margin = 2;
  
  // Simple QR code placeholder - in production use a proper QR library
  const qrData = `solana:${text}`;
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${size * 10}" height="${size * 10}" viewBox="0 0 ${size * 10} ${size * 10}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size * 10}" height="${size * 10}" fill="white"/>
      <rect x="${margin * 10}" y="${margin * 10}" width="${(size - margin * 2) * 10}" height="${(size - margin * 2) * 10}" fill="black"/>
      <text x="${size * 5}" y="${size * 5 + 3}" text-anchor="middle" fill="white" font-size="2" font-family="monospace">SOL</text>
    </svg>
  `)}`;
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/store/cart';
import { orderService, CreateOrderRequest, ShippingRate } from '@/services/order.service';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Truck, Shield, CreditCard, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { supabase, supabaseService } from '@/lib/supabase';
import { useDynamicWallet } from '@/components/wallet/DynamicWalletProvider';

export default function CheckoutPage() {
  const { connected, publicKey } = useDynamicWallet();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'rush' | 'express'>('standard');
  const [order, setOrder] = useState<any>(null);
  const [paymentAddress, setPaymentAddress] = useState('');
  const [amountSol, setAmountSol] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [solConversion, setSolConversion] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const { items, getTotalItems, getSubtotal, getTotalWeight, clearCart } = useCartStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Customer Info
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    
    // Shipping Address Only
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'US',
    
    // Order Notes
    notes: ''
  });

  // Load existing user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const walletAddress = publicKey?.toString() || 'anonymous';
          
        // Check if user exists and get their data via API
        const userResponse = await fetch('/api/user/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
          }),
        });

        if (!userResponse.ok) {
          console.error('Error loading user data');
          return;
        }

        const userResult = await userResponse.json();
        const user = userResult.user;

        // Get user's shipping address
        const addressResponse = await fetch('/api/user/address/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_wallet_address: walletAddress,
            type: 'shipping'
          }),
        });

        let shippingAddress: any = null;
        if (addressResponse.ok) {
          const addressResult = await addressResponse.json();
          shippingAddress = addressResult.address;
        }

        // Auto-populate form with existing data
        const updatedFormData = {
          // Customer Info - combine first and last names from address, fallback to user table
          customer_name: shippingAddress 
            ? `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim()
            : (user?.name || user?.username || ''),
          customer_email: user?.email || '',
          customer_phone: shippingAddress?.phone || '',
          
          // Shipping Address
          shipping_address: shippingAddress?.address_line_1 || '',
          shipping_city: shippingAddress?.city || '',
          shipping_state: shippingAddress?.state || '',
          shipping_zip: shippingAddress?.zip_code || '',
          shipping_country: shippingAddress?.country || 'US',
          
          // Order Notes
          notes: shippingAddress?.notes || ''
        };

        setFormData(updatedFormData);
        
        if (user?.email || shippingAddress) {
          console.log('User data auto-populated:', {
            email: user?.email,
            shippingAddress: shippingAddress ? 'Found' : 'Not found'
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Don't show error to user, just continue with empty form
      }
    };

    // Only load if wallet is connected
    if (connected && publicKey) {
      loadUserData();
    }
  }, [connected, publicKey]); // Dependencies: load when wallet connects

  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/merch/cart');
      return;
    }

    loadShippingRates();
  }, [items, router]);

  useEffect(() => {
    if (!connected) {
      toast.error('Please connect your wallet to continue');
      router.push('/merch');
      return;
    }
  }, [connected, router]);

  const loadShippingRates = async () => {
    try {
      const rates = await orderService.getAllShippingRates();
      setShippingRates(rates);
    } catch (error) {
      console.error('Error loading shipping rates:', error);
      toast.error('Failed to load shipping rates');
    }
  };

  const calculateShippingCost = () => {
    const rate = shippingRates.find(r => r.method === selectedShipping);
    if (!rate) return 0;
    
    const subtotal = getSubtotal();
    const weight = getTotalWeight();
    
    let cost = rate.base_cost;
    if (weight > 0) {
      cost += weight * rate.cost_per_lb;
    }
    
    // Check for free shipping
    if (rate.free_shipping_threshold && subtotal >= rate.free_shipping_threshold) {
      cost = 0;
    }
    
    return cost;
  };

  const subtotal = getSubtotal();
  const shipping = calculateShippingCost();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Load SOL conversion when total changes
  useEffect(() => {
    if (total > 0) {
      loadSOLConversion();
    }
  }, [total]);

  const loadSOLConversion = async () => {
    setLoadingPrice(true);
    try {
      const conversion = await cryptoService.convertUSDToSOL(total);
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
    if (step === 3 && order && !paymentConfirmed) {
      const interval = setInterval(async () => {
        try {
          const updatedOrder = await orderService.getOrderById(order.order.id);
          if (updatedOrder.status === 'paid') {
            setPaymentConfirmed(true);
            toast.success('Payment confirmed! 🎉');
            // Clear cart and redirect to success page
            setTimeout(() => {
              clearCart();
              router.push('/merch/success');
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [step, order, paymentConfirmed, router, clearCart]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.customer_name || !formData.customer_email) {
      toast.error('Please fill in required fields');
      return false;
    }
    
    if (!formData.shipping_address || !formData.shipping_city || !formData.shipping_zip || !formData.shipping_country) {
      toast.error('Please complete shipping address');
      return false;
    }
    
    return true;
  };

  const saveUserShippingInfo = async () => {
    try {
      // Get current user wallet address from cart or create one
      const walletAddress = publicKey?.toString() || 'anonymous';
        
      // Check if user exists and get their current data via API
      const response = await fetch('/api/user/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
        }),
      });

      if (!response.ok) {
        console.error('Error fetching user data');
        toast.error('Failed to save user information');
        return false;
      }

      const result = await response.json();
      const existingUser = result.user;

      if (!existingUser) {
        // Create user via API if doesn't exist
        const createResponse = await fetch('/api/user/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            role: 'customer',
            email: formData.customer_email
          }),
        });

        if (!createResponse.ok) {
          console.error('Error creating user');
          toast.error('Failed to create user account');
          return false;
        }
      } else {
        // User exists - update email if it's different or not set via API
        if (!existingUser.email || existingUser.email !== formData.customer_email) {
          const updateResponse = await fetch('/api/user/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wallet_address: walletAddress,
              email: formData.customer_email
            }),
          });

          if (!updateResponse.ok) {
            console.error('Error updating user email');
            toast.error('Failed to save email');
            return false;
          }
        }
      }

      // Split customer name into first and last name
      const nameParts = formData.customer_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if user already has a shipping address
      const checkAddressResponse = await fetch('/api/user/address/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_wallet_address: walletAddress,
          type: 'shipping'
        }),
      });

      let existingAddress = null;
      if (checkAddressResponse.ok) {
        const addressResult = await checkAddressResponse.json();
        existingAddress = addressResult.address;
      }

      const addressData = {
        user_wallet_address: walletAddress,
        type: 'shipping',
        first_name: firstName,
        last_name: lastName,
        company: '',
        address_line_1: formData.shipping_address,
        address_line_2: '',
        city: formData.shipping_city,
        state: formData.shipping_state,
        zip_code: formData.shipping_zip,
        country: formData.shipping_country,
        phone: formData.customer_phone,
        notes: formData.notes
      };

      if (existingAddress) {
        // Update existing shipping address
        const updateResponse = await fetch('/api/user/address/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        });

        if (!updateResponse.ok) {
          console.error('Error updating shipping address');
          toast.error('Failed to save shipping information');
          return false;
        }
      } else {
        // Create new shipping address
        const createResponse = await fetch('/api/user/address/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...addressData,
            is_default: true
          }),
        });

        if (!createResponse.ok) {
          console.error('Error creating shipping address');
          toast.error('Failed to save shipping information');
          return false;
        }
      }

      toast.success('Shipping information saved!');
      return true;
    } catch (error) {
      console.error('Error saving user shipping info:', error);
      toast.error('Failed to save shipping information');
      return false;
    }
  };

  const handleStep1 = async () => {
    if (!validateStep1()) return;
    
    // Save user shipping info first
    const userSaved = await saveUserShippingInfo();
    if (!userSaved) return;
    
    // Generate SOL payment address and convert directly
    await generatePaymentAndConvert();
    setStep(3);
  };

  const generatePaymentAndConvert = async () => {
    setLoading(true);
    
    try {
      const walletAddress = publicKey?.toString() || 'anonymous';
      
      // Check for existing pending orders first
      const existingOrdersResponse = await fetch('/api/orders/by-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_wallet_address: walletAddress,
          status: 'pending'
        }),
      });

      let existingPendingOrder:any = null;
      if (existingOrdersResponse.ok) {
        const ordersData = await existingOrdersResponse.json();
        if (ordersData.orders && ordersData.orders.length > 0) {
          // Use the most recent pending order
          existingPendingOrder = ordersData.orders[0];
          console.log('Found existing pending order:', existingPendingOrder.id);
        }
      }

      let order;
      if (existingPendingOrder) {
        // Use existing pending order
        order = existingPendingOrder;
        toast.info('Using your existing pending order');
      } else {
        // Create new order
        const orderData: CreateOrderRequest = {
          customer_wallet_address: walletAddress, // Link order to user wallet
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          billing_address: formData.shipping_address,
          billing_city: formData.shipping_city,
          billing_state: formData.shipping_state,
          billing_zip: formData.shipping_zip,
          billing_country: formData.shipping_country,
          shipping_address: formData.shipping_address,
          shipping_city: formData.shipping_city,
          shipping_state: formData.shipping_state,
          shipping_zip: formData.shipping_zip,
          shipping_country: formData.shipping_country,
          shipping_method: 'standard', // Default shipping for Web3
          items: items,
          notes: formData.notes
        };

        // Create order via API route
        const orderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          toast.error(errorData.error || 'Failed to create order');
          return;
        }

        const createdOrder = await orderResponse.json();
        order = createdOrder.order;
        console.log('Created new order:', order.id);
      }

      setOrder({ order: order });

      // Generate SOL payment address and convert
      const conversion = await cryptoService.convertUSDToSOL(order.total_amount);
      setSolConversion(conversion);
      
      // Set payment address
      setPaymentAddress(order.solana_payment_address || '11111111111111111111111111111111111112');
      setAmountSol(conversion.solAmount);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
    setCopiedAddress(true);
    toast.success('Payment address copied to clipboard');
    setTimeout(() => setCopiedAddress(false), 3000);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatSolAmount = (amount: number) => {
    return `${amount.toFixed(6)} SOL`;
  };

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 mb-10">
      <SharedHeader />
      <div className="flex-grow mt-10">
        <div className="container mx-auto px-4 py-8 mt-10">
        <div className="max-w-6xl mx-auto mt-10">
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
                  🚀 CHECKOUT LAUNCHPAD 🚀
                </span>
              </h1>
              <p className="text-lg text-gray-300">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                  {step === 1 ? '📝 Drop Your Details' :
                   step === 2 ? '📦 Confirm Shipping' : 
                   step === 3 ? '💰 Send Payment' : '🎯 Mission Complete'}
                </span>
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-purple-400' : 'text-gray-500'} transition-all duration-300`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50' : 'bg-gray-700'}`}>
                  {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <span className="ml-2 text-sm">📝 Details</span>
              </div>
              
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-700'} transition-all duration-300`}></div>
              
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-purple-400' : 'text-gray-500'} transition-all duration-300`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50' : 'bg-gray-700'}`}>
                  {step > 2 ? <Check className="w-5 h-5" /> : '2'}
                </div>
                <span className="ml-2 text-sm">📦 Shipping</span>
              </div>
              
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-700'} transition-all duration-300`}></div>
              
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-purple-400' : 'text-gray-500'} transition-all duration-300`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50' : 'bg-gray-700'}`}>
                  {step > 3 ? <Check className="w-5 h-5" /> : '3'}
                </div>
                <span className="ml-2 text-sm">💰 Payment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Customer Information */}
              {step === 1 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer_name" className="text-gray-300">Full Name *</Label>
                          <Input
                            id="customer_name"
                            value={formData.customer_name}
                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer_email" className="text-gray-300">Email Address *</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => handleInputChange('customer_email', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer_phone" className="text-gray-300">Phone Number</Label>
                          <Input
                            id="customer_phone"
                            value={formData.customer_phone}
                            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="shipping_address" className="text-gray-300">Street Address *</Label>
                          <Input
                            id="shipping_address"
                            value={formData.shipping_address}
                            onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping_city" className="text-gray-300">City *</Label>
                          <Input
                            id="shipping_city"
                            value={formData.shipping_city}
                            onChange={(e) => handleInputChange('shipping_city', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping_state" className="text-gray-300">State</Label>
                          <Input
                            id="shipping_state"
                            value={formData.shipping_state}
                            onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping_zip" className="text-gray-300">ZIP Code *</Label>
                          <Input
                            id="shipping_zip"
                            value={formData.shipping_zip}
                            onChange={(e) => handleInputChange('shipping_zip', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping_country" className="text-gray-300">Country *</Label>
                          <Select value={formData.shipping_country} onValueChange={(value) => handleInputChange('shipping_country', value)}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-gray-300">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Special instructions or delivery notes..."
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleStep1}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          Continue to Payment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment */}
              {step === 3 && order && (
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
                      {paymentAddress && (
                        <div className="flex justify-center mt-4 mb-4">
                          <div className="bg-white p-4 rounded-lg">
                            <img 
                              src={generateQRCode(paymentAddress)} 
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
                      
                      {/* Refresh Price Button */}
                      <div className="mt-3">
                        <Button
                          onClick={loadSOLConversion}
                          disabled={loadingPrice}
                          variant="outline"
                          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                        >
                          {loadingPrice ? 'Updating...' : '🔄 Refresh Price'}
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
              )}
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
                    {items.map((item) => {
                      const unitPrice = item.product.base_price + (item.variant?.price_adjustment || 0);
                      const totalPrice = unitPrice * item.quantity;
                      
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {item.quantity} × {item.product.name}
                          </span>
                          <span className="text-white">{formatPrice(totalPrice)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="bg-slate-600" />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white">
                        {shipping === 0 ? (
                          <span className="text-green-400">FREE</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <Separator className="bg-slate-600" />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-purple-400">{formatPrice(total)}</span>
                  </div>

                  {/* Security Badges */}
                  <div className="space-y-2 pt-4 border-t border-slate-600">
                    <div className="flex items-center text-xs text-gray-400">
                      <Shield className="w-4 h-4 mr-2 text-green-400" />
                      Secure checkout
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Truck className="w-4 h-4 mr-2 text-blue-400" />
                      Fast worldwide shipping
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <CreditCard className="w-4 h-4 mr-2 text-purple-400" />
                      Solana payments
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