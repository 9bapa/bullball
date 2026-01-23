import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Zap,
  Users,
  Trophy,
  Flame,
  Gamepad2,
  Coins,
  Target,
  Clock,
  Sparkles,
  TrendingUp,
  Gift,
  Shield,
  ArrowRight,
  HelpCircle,
  Truck,
  RotateCcw
} from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function AboutPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: 'Crypto Merch Marketplace',
      description: 'The go-to destination for premium crypto merchandise, swag, and gag gifts. From hoodies to hats, mugs to memes - we have everything to show off your crypto passion.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: '24/7 BullRhuns',
      description: 'Activate your community at a moment\'s notice with the BullRhun trade game. Create endless trading competitions that keep your token buzzing 24/7.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Trophy,
      title: 'Win Big with Trading Games',
      description: 'The Xth trade wins the pot! Each trade adds 0.05% to the prize pool, creating excitement and driving community engagement.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Turn Charts Green',
      description: 'A powerful community wallet mechanism that generates trading volume and brings your token\'s charts back to life. Energize your community with every trade.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  const sellingPoints = [
    {
      icon: Sparkles,
      title: 'Instant Game Creation',
      description: 'Register any SPL token and instantly create a BullRhun game with randomized trade goals, minimum amounts, and trade types.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Flame,
      title: 'Bull Mode Games',
      description: 'High-stakes games with bigger prize pots. Enable Bull Mode for maximum community engagement and excitement.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Every trade contributes to the prize pot and energizes your community. Watch your token come alive as traders compete for the prize.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Clock,
      title: 'Auto Goal Reduction',
      description: 'Goals automatically drop by 15 after 5+ minutes of inactivity, keeping games moving and preventing stalemates.',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Built on Solana blockchain with transparent prize pools. Game wallets are verifiable and payouts are automatic.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Gift,
      title: 'Low Fees',
      description: 'Each trade incurs only a 1% fee: 0.05% goes to the game wallet (prize pot) and 0.05% to the platform.',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create a Game',
      description: 'Register an SPL token to create a BullRhun game with random settings including trade goal, minimum amount, and trade type.',
      icon: Target
    },
    {
      step: '02',
      title: 'Trade & Compete',
      description: 'Each trade adds 0.05% to the prize pot and counts towards the goal. The community rallies around your token.',
      icon: Zap
    },
    {
      step: '03',
      title: 'Hit the Goal',
      description: 'The trader who makes the winning trade reaches the goal and wins the entire prize pot automatically!',
      icon: Trophy
    }
  ]

  const stats = [
    { value: '0.05%', label: 'Per Trade to Pot', icon: Coins },
    { value: '1%', label: 'Total Fee', icon: Shield },
    { value: '15', label: 'Auto Goal Drop', icon: Clock },
    { value: '24/7', label: 'Always Active', icon: Flame }
  ]

  const supportSections = [
    {
      id: 'help-center',
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Need assistance? Our help center provides comprehensive guides, FAQs, and troubleshooting tips to help you get the most out of BullRhun.',
      items: [
        { label: 'Getting Started Guide', description: 'Learn the basics of shopping, trading games, and managing your account.' },
        { label: 'BullRhun Trading Game', description: 'Understand how trading games work and how to create your own.' },
        { label: 'Account & Wallet', description: 'Manage your profile, wallet connections, and security settings.' },
        { label: 'Troubleshooting', description: 'Common issues and solutions for smooth platform experience.' }
      ]
    },
    {
      id: 'shipping-info',
      icon: Truck,
      title: 'Shipping Info',
      description: 'We ship crypto merch worldwide with reliable carriers and tracking.',
      items: [
        { label: 'Processing Time', description: 'Orders are processed within 1-3 business days.' },
        { label: 'Shipping Times', description: 'Domestic: 3-7 business days. International: 7-21 business days.' },
        { label: 'Tracking', description: 'All orders include tracking information sent via email.' },
        { label: 'Shipping Costs', description: 'Calculated at checkout based on location and order weight.' }
      ]
    },
    {
      id: 'returns',
      icon: RotateCcw,
      title: 'Returns & Refunds',
      description: 'We want you to love your crypto merch. Here\'s our return policy.',
      items: [
        { label: 'Return Window', description: '30-day return policy from the date of delivery.' },
        { label: 'Condition', description: 'Items must be unworn, unwashed, and in original packaging.' },
        { label: 'Refund Process', description: 'Refunds are processed within 5-7 business days of return receipt.' },
        { label: 'Exchanges', description: 'Size exchanges available for eligible items within the return window.' }
      ]
    }
  ]

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative">
              <div className="text-center">
                <Badge className="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  <Flame className="w-4 h-4 mr-2" />
                  The Future of Crypto Commerce & Community
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                    Welcome to BullRhun
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                  Your one-stop destination for crypto merch, swag, and gag gifts. Plus, power your community
                  with 24/7 BullRhun trading games that turn charts green and engage your token holders.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <a href="/">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Shop Merch
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 border-2 border-primary/20"
                  >
                    <a href="/swap">
                      <Gamepad2 className="w-5 h-5 mr-2" />
                      Play BullRhun
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Features Section */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">What We Offer</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Two powerful tools for the crypto ecosystem: a premier marketplace for crypto merchandise
                  and an innovative trading game to energize your community.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="group hover:scale-[1.02] transition-all duration-300 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-xl hover:shadow-primary/10"
                  >
                    <CardHeader>
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform w-fit`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">Game Mechanics</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Fair, transparent, and designed to keep your community engaged around the clock.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="text-center border-primary/10 bg-gradient-to-br from-background to-primary/5"
                  >
                    <CardContent className="p-8">
                      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Selling Points Grid */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">Why BullRhun?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to activate your community and boost trading volume.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellingPoints.map((point, index) => (
                  <Card
                    key={index}
                    className="hover:scale-[1.02] transition-all duration-300 border-primary/10 hover:border-primary/30"
                  >
                    <CardContent className="p-6">
                      <div className={`inline-flex p-3 rounded-xl ${point.bg} mb-4`}>
                        <point.icon className={`w-6 h-6 ${point.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
              <div className="text-center mb-16">
                <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Trading Game
                </Badge>
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">How BullRhun Works</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Create excitement, drive volume, and reward your community in three simple steps.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {howItWorks.map((item, index) => (
                  <Card
                    key={index}
                    className="relative border-primary/10 hover:border-primary/30 transition-all"
                  >
                    <CardContent className="p-8">
                      <div className="text-5xl font-bold text-primary/10 mb-4">{item.step}</div>
                      <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Support Sections */}
          <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              {supportSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <div key={section.id} id={section.id} className="mb-20 last:mb-0">
                      <div className="text-center mb-12">
                        <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                          <Icon className="w-4 h-4 mr-2" />
                          {section.title}
                        </Badge>
                        <h2 className="text-3xl lg:text-5xl font-bold mb-4">{section.title}</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                          {section.description}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {section.items.map((item, idx) => (
                          <Card
                            key={idx}
                            className="hover:scale-[1.02] transition-all duration-300 border-primary/10 hover:border-primary/30"
                          >
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
              <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl" />
                </div>

                <CardContent className="relative p-12 lg:p-16 text-center">
                  <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                    Ready to Start?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of crypto enthusiasts shopping for merch and creating
                    exciting trading games. Your community awaits.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <a href="/swap">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create a Game
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 border-2 border-primary/20"
                    >
                      <a href="/">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Shop Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
                <MobileBottomNav />
      </div>
    </>
  )
}
