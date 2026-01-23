'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { MapPin, Plus, Edit, Trash2, Check, Home, User, Phone, Globe } from 'lucide-react'

interface Address {
  id: string
  user_wallet_address: string
  type: 'shipping' | 'billing'
  is_default: boolean
  first_name: string
  last_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state?: string
  zip_code: string
  country: string
  phone?: string
  created_at: string
}

interface AddressSelectorProps {
  walletAddress: string | null
  selectedAddress: Address | null
  onAddressSelect: (address: Address | null) => void
  onNewAddress: () => void
  onEditAddress: (address: Address) => void
  onAddressSaved: (address: Address) => void
}

export function AddressSelector({
  walletAddress,
  selectedAddress,
  onAddressSelect,
  onNewAddress,
  onEditAddress,
  onAddressSaved
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { toast } = useToast()
  const [newAddress, setNewAddress] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    is_default: false,
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: ''
  })

  // Fetch saved addresses
  useEffect(() => {
    if (!walletAddress) return

    const fetchAddresses = async () => {
      try {
        const response = await fetch(`/api/user-addresses?wallet=${walletAddress}`)
        const data = await response.json()
        
        if (data.success) {
          setAddresses(data.addresses)
          
          // Auto-select default address if available
          const defaultAddress = data.addresses.find((addr: Address) => addr.is_default)
          if (defaultAddress && !selectedAddress) {
            onAddressSelect(defaultAddress)
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [walletAddress])

  const handleSaveAddress = async () => {
    if (!walletAddress) return

    try {
      const addressData = {
        ...newAddress,
        user_wallet_address: walletAddress
      }

      const url = editingAddress 
        ? `/api/user-addresses/${editingAddress.id}`
        : '/api/user-addresses'
      
      const method = editingAddress ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh addresses list
        const addressesResponse = await fetch(`/api/user-addresses?wallet=${walletAddress}`)
        const addressesData = await addressesResponse.json()
        
        if (addressesData.success) {
          setAddresses(addressesData.addresses)
          onAddressSaved(data.address)

          // Success toast
          toast({
            title: editingAddress ? 'Address Updated' : 'Address Saved',
            description: `Your ${editingAddress ? 'address has been updated' : 'new address has been saved'} successfully.`,
          })

          // Reset form
          setShowNewAddressForm(false)
          setEditingAddress(null)
          setNewAddress({
            type: 'shipping',
            is_default: false,
            first_name: '',
            last_name: '',
            company: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'US',
            phone: ''
          })
        }
      }
    } catch (error) {
      console.error('Error saving address:', error)
      
      // Error toast
      toast({
        title: 'Save Failed',
        description: 'There was an error saving your address. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!walletAddress) return

    try {
      const response = await fetch(`/api/user-addresses/${addressId}?wallet=${walletAddress}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId))
        if (selectedAddress?.id === addressId) {
          onAddressSelect(null)
        }

        // Success toast
        toast({
          title: 'Address Deleted',
          description: 'The address has been removed from your account.',
        })
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      
      // Error toast
      toast({
        title: 'Delete Failed',
        description: 'There was an error removing address. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const formatAddress = (address: Address) => {
    const lines = [
      address.first_name + ' ' + address.last_name,
      address.company,
      address.address_line_1,
      address.address_line_2,
      `${address.city}, ${address.state || ''} ${address.zip_code}`,
      address.country
    ].filter(Boolean)

    return lines.join(', ')
  }

  if (loading) {
    return (
      <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
        <CardContent className="relative z-10 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-primary/20 rounded w-1/4"></div>
            <div className="h-4 bg-primary/20 rounded w-1/2"></div>
            <div className="h-4 bg-primary/20 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between font-display">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20 shadow-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">Shipping Address</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowNewAddressForm(!showNewAddressForm)
              setEditingAddress(null)
            }}
            className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-primary/50"
          >
            {showNewAddressForm ? (
              <>Show Saved</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                New Address
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {!showNewAddressForm && addresses.length > 0 ? (
          <div className="space-y-4">
            <RadioGroup
              value={selectedAddress?.id || ''}
              onValueChange={(value) => {
                const address = addresses.find(addr => addr.id === value)
                onAddressSelect(address || null)
              }}
            >
              {addresses.map((address) => (
                <div key={address.id} className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <RadioGroupItem value={address.id} id={address.id} className="h-5 w-5" />
                  <Label 
                    htmlFor={address.id} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {address.first_name} {address.last_name}
                          </span>
                          {address.is_default && (
                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:scale-105 transition-transform">
                              <Home className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {address.company && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                              </div>
                              <span>{address.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-primary/60" />
                            <span>{address.address_line_1}</span>
                          </div>
                          {address.address_line_2 && (
                            <div className="flex items-center gap-2 ml-6">
                              <span>{address.address_line_2}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary/60" />
                            <span>{address.city}, {address.state || ''} {address.zip_code}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                            </div>
                            <span>{address.country}</span>
                          </div>
                          {address.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary/60" />
                              <span>{address.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setEditingAddress(address)
                            setNewAddress({
                              type: address.type,
                              is_default: address.is_default,
                              first_name: address.first_name,
                              last_name: address.last_name,
                              company: address.company || '',
                              address_line_1: address.address_line_1,
                              address_line_2: address.address_line_2 || '',
                              city: address.city,
                              state: address.state || '',
                              zip_code: address.zip_code,
                              country: address.country,
                              phone: address.phone || ''
                            })
                            setShowNewAddressForm(true)
                          }}
                          className="hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            handleDeleteAddress(address.id)
                          }}
                          className="hover:bg-red-10 hover:text-red-500 hover:scale-105 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <>
            {addresses.length === 0 && !showNewAddressForm && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Addresses</h3>
                <p className="text-sm">Add your first shipping address to get started</p>
              </div>
            )}
          </>
        )}

        {showNewAddressForm && (
          <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md border border-border/40 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg"></div>
              <h3 className="text-xl font-display font-bold text-foreground">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="first_name" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  value={newAddress.first_name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="John"
                  className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="last_name" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  value={newAddress.last_name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Doe"
                  className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="company" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                Company (Optional)
              </Label>
              <Input
                id="company"
                value={newAddress.company}
                onChange={(e) => setNewAddress(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Inc."
                className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="address_line_1" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                Address Line 1 *
              </Label>
              <Input
                id="address_line_1"
                value={newAddress.address_line_1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                placeholder="123 Main St"
                className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="address_line_2" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                Address Line 2 (Optional)
              </Label>
              <Input
                id="address_line_2"
                value={newAddress.address_line_2}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                placeholder="Apt 4B"
                className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="city" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  City *
                </Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="New York"
                  className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="state" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  State
                </Label>
                <Input
                  id="state"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="NY"
                  className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="zip_code" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  ZIP Code *
                </Label>
                <Input
                  id="zip_code"
                  value={newAddress.zip_code}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, zip_code: e.target.value }))}
                  placeholder="10001"
                  className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="country" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                Country *
              </Label>
              <Select
                value={newAddress.country}
                onValueChange={(value) => setNewAddress(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300">
              <Checkbox
                id="is_default"
                checked={newAddress.is_default}
                onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, is_default: checked as boolean }))}
                className="h-5 w-5"
              />
              <Label 
                htmlFor="is_default" 
                className="cursor-pointer text-sm font-medium flex items-center gap-2"
              >
                <Home className="h-4 w-4 text-primary" />
                Set as default shipping address
              </Label>
            </div>

            <div className="flex gap-4 pt-6 border-t border-border/30">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewAddressForm(false)
                  setEditingAddress(null)
                }}
                className="flex-1 h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-primary/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={!newAddress.first_name || !newAddress.last_name || !newAddress.address_line_1 || !newAddress.city || !newAddress.zip_code || !newAddress.country}
                className="flex-1 h-12 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80"
              >
                <Check className="h-5 w-5 mr-2" />
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}