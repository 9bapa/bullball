'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import {
  Button,
} from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { CustomModal } from '@/components/ui/custom-modal'
import { InfoNotice } from '@/components/ui/info-notice'
import TablesSection from '@/components/ui-kit/TablesSection'
import TabsSection from '@/components/ui-kit/TabsSection'
import AdditionalComponents from '@/components/ui-kit/AdditionalComponents'
import {
  Settings,
  User,
  Mail,
  Lock,
  Search,
  Star,
  Heart,
  Share2,
  Download,
  ShoppingCart,
  ArrowRight,
  Volume2,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Zap,
  Rocket,
  Wand2,
  Flame,
  Palette,
  Layers,
  Gift,
  Clock,
  Shield,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UIKitPage() {
  const [switchState, setSwitchState] = useState(false)
  const [sliderValue, setSliderValue] = useState([50])
  const [checkboxState, setCheckboxState] = useState(false)
  const [showNotice, setShowNotice] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute top-40 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 relative z-10 pb-16 md:pb-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 border-b border-border/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-transparent to-background" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
            <div className="text-center space-y-6">
              <Badge
                variant="default"
                className="text-xs px-4 py-1.5 font-mono font-semibold shadow-lg hover:scale-105 transition-transform animate-pulse-slow"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                v2.0.0
              </Badge>

              <h1 className="font-display text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-shift relative">
                <span className="relative z-10">UI Kit</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-3xl -z-10" />
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A magical collection of beautifully styled, accessible, and futuristic
                UI components inspired by Pixar's approachable design language.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                {[
                  { icon: Rocket, label: 'Fast' },
                  { icon: Wand2, label: 'Magical' },
                  { icon: Shield, label: 'Accessible' },
                  { icon: Target, label: 'Precise' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-border/40 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 space-y-24">
          {/* Info Notices Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Info Notices</h2>
                <p className="text-muted-foreground text-sm font-mono">Dynamic feedback components</p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoNotice
                variant="magic"
                title="Welcome to the Future"
                message="Discover our Pixar-inspired design system with magical interactions and playful animations."
                action={{ label: 'Explore Components', onClick: () => {} }}
                onClose={() => {}}
                className="shadow-2xl"
              />

              <InfoNotice
                variant="success"
                title="Order Confirmed!"
                message="Your BullRun Legendary Card is on its way. Track your package in the orders section."
                action={{ label: 'Track Order', onClick: () => {} }}
                onClose={() => {}}
              />

              <InfoNotice
                variant="info"
                title="New Feature: Custom Themes"
                message="You can now choose from 21+ color presets or create your own custom color scheme."
                action={{ label: 'Try It Now', onClick: () => {} }}
                onClose={() => {}}
              />

              <InfoNotice
                variant="warning"
                title="Cart Almost Full"
                message="You have 4 items in your cart. Checkout now to avoid missing out on our limited edition cards."
                action={{ label: 'View Cart', onClick: () => {} }}
                dismissible
                onClose={() => {}}
              />

              <InfoNotice
                variant="error"
                title="Payment Failed"
                message="Unable to process payment. Please check your card details or try another payment method."
                action={{ label: 'Try Again', onClick: () => {} }}
                dismissible
                onClose={() => {}}
              />
            </div>
          </section>

          {/* Custom Modals Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Interactive Modals</h2>
                <p className="text-muted-foreground text-sm font-mono">Success, error, and info dialogs</p>
              </div>
            </div>

            <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
              <div className="relative z-10">
                <CardHeader className="pb-6">
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-3">
                    <Flame className="h-6 w-6 text-primary" />
                    Click to Open Modals
                  </CardTitle>
                  <CardDescription className="text-base">
                    Experience our animated, Pixar-style modal dialogs with smooth transitions and delightful interactions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CustomModal
                      variant="success"
                      title="Order Confirmed!"
                      description="Your order #BR-2024-001 has been successfully placed. You'll receive a confirmation email shortly with tracking information."
                      primaryAction={{
                        label: 'View Order',
                        onClick: () => {},
                      }}
                      secondaryAction={{
                        label: 'Continue Shopping',
                        onClick: () => {},
                      }}
                    />

                    <CustomModal
                      variant="error"
                      title="Payment Failed"
                      description="We couldn't process your payment. Please check your payment details or try a different payment method."
                      primaryAction={{
                        label: 'Try Again',
                        onClick: () => {},
                      }}
                      secondaryAction={{
                        label: 'Contact Support',
                        onClick: () => {},
                      }}
                    />

                    <CustomModal
                      variant="info"
                      title="Welcome to BullRun"
                      description="Discover our exclusive collection of crypto-themed trading cards. Each card is a unique piece of digital art."
                      primaryAction={{
                        label: 'Explore Collection',
                        onClick: () => {},
                      }}
                    />

                    <CustomModal
                      variant="warning"
                      title="Cart Almost Full"
                      description="You have 4 items in your cart. Some cards have limited quantities. Complete your purchase now!"
                      primaryAction={{
                        label: 'Proceed to Checkout',
                        onClick: () => {},
                      }}
                      secondaryAction={{
                        label: 'Continue Browsing',
                        onClick: () => {},
                      }}
                    />

                    <CustomModal
                      variant="magic"
                      title="✨ Special Offer! ✨"
                      description="You've unlocked a secret discount! Get 20% off your next purchase with code: MAGIC20"
                      primaryAction={{
                        label: 'Apply Discount',
                        onClick: () => {},
                      }}
                    />

                    <CustomModal
                      variant="error"
                      title="Connection Lost"
                      description="We've lost connection to our servers. Please check your internet connection and try again."
                      primaryAction={{
                        label: 'Retry Connection',
                        onClick: () => {},
                      }}
                    />
                  </div>
                </CardContent>
              </div>
            </Card>
          </section>

          {/* Typography Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Typography</h2>
                <p className="text-muted-foreground text-sm font-mono">Text styles and hierarchy</p>
              </div>
            </div>

            <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
              <CardContent className="relative z-10 pt-8 space-y-10">
                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Heading 1</p>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    The quick brown fox jumps
                  </h1>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Heading 2</p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    The quick brown fox jumps
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Heading 3</p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    The quick brown fox jumps
                  </h3>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Body Text</p>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Monospace</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    $ 249.99 • BTC • 2x • #BULLRUN
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Buttons Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Buttons</h2>
                <p className="text-muted-foreground text-sm font-mono">Interactive elements and actions</p>
              </div>
            </div>

            <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
              <CardContent className="relative z-10 pt-8 space-y-10">
                {/* Default Size */}
                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Default Size</p>
                  <div className="flex flex-wrap gap-4">
                    <Button className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="secondary"
                      className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Save for Later
                    </Button>
                    <Button
                      variant="outline"
                      className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-primary/50"
                    >
                      Compare
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:scale-105 transition-transform duration-300"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Button Sizes</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm" className="shadow-md hover:scale-105 transition-all duration-300">
                      Small
                    </Button>
                    <Button className="shadow-lg hover:scale-105 transition-all duration-300">
                      Default
                    </Button>
                    <Button size="lg" className="shadow-xl hover:scale-105 transition-all duration-300">
                      Large
                    </Button>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Icon Buttons</p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="icon" className="shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
                      <Settings className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:scale-110 transition-transform duration-300"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Gradient Button */}
                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Special Button</p>
                  <Button
                    className="w-full md:w-auto h-12 text-base font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Form Elements Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Form Elements</h2>
                <p className="text-muted-foreground text-sm font-mono">Input fields and form controls</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
                <CardContent className="relative z-10 pt-8 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="font-mono text-sm uppercase tracking-wider">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="font-mono text-sm uppercase tracking-wider">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="•••••••••"
                      className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="search" className="font-mono text-sm uppercase tracking-wider">
                      Search
                    </Label>
                    <Input
                      id="search"
                      type="search"
                      placeholder="Search cards..."
                      className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="font-mono text-sm uppercase tracking-wider">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Write your message..."
                      className="min-h-[120px] border-2 focus:border-primary/50 shadow-lg transition-all duration-300"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-secondary/5 backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 opacity-30" />
                <CardContent className="relative z-10 pt-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                      Checkboxes
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300">
                        <Checkbox
                          id="terms"
                          checked={checkboxState}
                          onCheckedChange={setCheckboxState}
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor="terms"
                          className="cursor-pointer text-sm font-medium"
                        >
                          Accept terms and conditions
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300">
                        <Checkbox
                          id="newsletter"
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor="newsletter"
                          className="cursor-pointer text-sm font-medium"
                        >
                          Subscribe to newsletter
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                      Switches
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300">
                        <Label className="text-sm font-medium">Push notifications</Label>
                        <Switch
                          checked={switchState}
                          onCheckedChange={setSwitchState}
                          className="h-6 w-11"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300">
                        <Label className="text-sm font-medium">Dark mode</Label>
                        <Switch className="h-6 w-11" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                      Select Dropdown
                    </p>
                    <Select>
                      <SelectTrigger className="h-11 border-2 focus:border-primary/50 shadow-lg transition-all duration-300">
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                        <SelectItem value="option4">Option 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cards Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Cards</h2>
                <p className="text-muted-foreground text-sm font-mono">Content containers</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/10 backdrop-blur-md overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pb-6">
                  <CardTitle className="font-display font-bold text-xl">Basic Card</CardTitle>
                  <CardDescription className="text-base">Simple content container</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    A clean card component with subtle gradients and smooth hover effects.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-md overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-display font-bold text-xl">Featured Card</CardTitle>
                      <CardDescription className="text-base">With gradient background</CardDescription>
                    </div>
                    <Badge className="bg-primary text-primary-foreground shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      NEW
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Enhanced card with gradient background and featured badge.
                  </p>
                </CardContent>
                <CardFooter className="relative z-10 pt-2">
                  <Button className="w-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-secondary/10 to-accent/5 backdrop-blur-md overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-transparent to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pb-6">
                  <CardTitle className="font-display font-bold text-xl">Action Card</CardTitle>
                  <CardDescription className="text-base">With interactive elements</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Card with action buttons and interactive hover effects.
                  </p>
                </CardContent>
                <CardFooter className="relative z-10 pt-2 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Confirm
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Badges</h2>
                <p className="text-muted-foreground text-sm font-mono">Labels and status indicators</p>
              </div>
            </div>

            <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
              <CardContent className="relative z-10 pt-8 space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Default Badges</p>
                  <div className="flex flex-wrap gap-4">
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform">
                      Default
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                    >
                      Secondary
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                    >
                      Outline
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Color Badges</p>
                  <div className="flex flex-wrap gap-4">
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-emerald-500 hover:bg-emerald-600 hover:scale-105 transition-all duration-300">
                      Success
                    </Badge>
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-blue-500 hover:bg-blue-600 hover:scale-105 transition-all duration-300">
                      Info
                    </Badge>
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-amber-500 hover:bg-amber-600 hover:scale-105 transition-all duration-300">
                      Warning
                    </Badge>
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-300">
                      Error
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Icon Badges</p>
                  <div className="flex flex-wrap gap-4">
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-all duration-300">
                      <Star className="h-3.5 w-3.5 mr-2" />
                      Featured
                    </Badge>
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-gradient-to-r from-secondary to-secondary/80 hover:scale-105 transition-all duration-300">
                      <Gift className="h-3.5 w-3.5 mr-2" />
                      Special
                    </Badge>
                    <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-gradient-to-r from-accent to-accent/80 hover:scale-105 transition-all duration-300">
                      <Flame className="h-3.5 w-3.5 mr-2" />
                      Hot
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Avatars Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Avatars</h2>
                <p className="text-muted-foreground text-sm font-mono">User profile images</p>
              </div>
            </div>

            <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
              <CardContent className="relative z-10 pt-8">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center space-y-2">
                    <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-foreground">FN</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-mono text-muted-foreground">Default</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Avatar className="h-16 w-16 border-3 border-primary/20 shadow-lg hover:scale-110 transition-all duration-300">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" />
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-foreground">AN</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-mono text-muted-foreground">Medium</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md hover:scale-110 transition-all duration-300">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-foreground">JN</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-mono text-muted-foreground">Small</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Avatar className="h-12 w-12 shadow-md bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-all duration-300">
                      <AvatarFallback className="text-foreground font-bold">AB</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-mono text-muted-foreground">Initials</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Avatar className="h-12 w-12 shadow-md bg-primary hover:scale-110 transition-all duration-300">
                      <AvatarFallback>
                        <User className="h-6 w-6 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-mono text-muted-foreground">Icon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Interactive Elements Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Interactive Elements</h2>
                <p className="text-muted-foreground text-sm font-mono">Tooltips, popovers, and menus</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden group hover:scale-105 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pb-6">
                  <CardTitle className="font-display font-bold text-xl">Tooltip</CardTitle>
                  <CardDescription className="text-base">Hover for info</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full h-12 shadow-lg hover:scale-105 transition-all duration-300">
                          Hover Me
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="shadow-xl border-2">
                        <p className="font-medium">This is a tooltip with helpful information!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-secondary/5 backdrop-blur-md overflow-hidden group hover:scale-105 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pb-6">
                  <CardTitle className="font-display font-bold text-xl">Popover</CardTitle>
                  <CardDescription className="text-base">Click to reveal</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 shadow-lg hover:scale-105 transition-all duration-300">
                        Open Popover
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="shadow-xl border-2 bg-background/95 backdrop-blur-md">
                      <div className="space-y-3">
                        <p className="font-semibold text-foreground">Popover Content</p>
                        <p className="text-sm text-muted-foreground">
                          Popovers can contain any content you need.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-accent/5 backdrop-blur-md overflow-hidden group hover:scale-105 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10 pb-6">
                  <CardTitle className="font-display font-bold text-xl">Dropdown Menu</CardTitle>
                  <CardDescription className="text-base">Context actions</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-12 shadow-lg hover:scale-105 transition-all duration-300">
                        <Settings className="mr-2 h-4 w-4" />
                        Options
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="shadow-xl border-2 bg-background/95 backdrop-blur-md">
                      <DropdownMenuLabel>Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Zap className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Navigation Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Navigation</h2>
                <p className="text-muted-foreground text-sm font-mono">Breadcrumbs and pagination</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
                <CardContent className="relative z-10 pt-8">
                  <div className="space-y-4">
                    <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Breadcrumb</p>
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/" className="text-foreground/70 hover:text-primary transition-colors">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/ui-kit" className="text-foreground/70 hover:text-primary transition-colors">Components</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage className="font-medium text-primary">Navigation</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-secondary/5 backdrop-blur-md overflow-hidden">
                <CardContent className="relative z-10 pt-8">
                  <div className="space-y-4">
                    <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Pagination</p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious className="shadow-lg hover:scale-105 transition-all duration-300" />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#" isActive className="shadow-lg hover:scale-105 transition-all duration-300">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#" className="shadow-lg hover:scale-105 transition-all duration-300">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#" className="shadow-lg hover:scale-105 transition-all duration-300">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext className="shadow-lg hover:scale-105 transition-all duration-300" />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Progress & Sliders Section */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Progress & Sliders</h2>
                <p className="text-muted-foreground text-sm font-mono">Indicators and range controls</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
                <CardContent className="relative z-10 pt-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">Upload Progress</p>
                      <span className="font-mono text-sm text-primary">75%</span>
                    </div>
                    <Progress value={75} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">Processing</p>
                      <span className="font-mono text-sm text-secondary">45%</span>
                    </div>
                    <Progress value={45} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">Download</p>
                      <span className="font-mono text-sm text-accent">90%</span>
                    </div>
                    <Progress value={90} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-secondary/5 backdrop-blur-md overflow-hidden">
                <CardContent className="relative z-10 pt-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">Volume</p>
                      <span className="font-mono text-sm text-primary">{sliderValue[0]}%</span>
                    </div>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">Brightness</p>
                      <span className="font-mono text-sm text-secondary">65%</span>
                    </div>
                    <Slider defaultValue={[65]} max={100} step={1} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">Price Range</p>
                      <span className="font-mono text-sm text-accent">$20 - $80</span>
                    </div>
                    <Slider defaultValue={[20, 80]} max={100} step={5} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          {/* Tables Section */}
          <TablesSection />

          {/* Tabs Section */}
          <TabsSection />

          {/* Additional Components Section */}
          <AdditionalComponents />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
