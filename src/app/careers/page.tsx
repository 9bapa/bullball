import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  Video,
  Twitter,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Globe,
  Shield
} from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function CareersPage() {
  const roles = [
    {
      icon: ShoppingBag,
      title: 'Merch Vendors',
      description: 'Are you a talented creator of crypto merchandise? We\'re looking for unique, high-quality crypto swag, apparel, and gag gifts to feature on our marketplace.',
      badge: 'High Priority',
      badgeColor: 'from-orange-500 to-amber-500',
      features: [
        'Sell your crypto merch to thousands of collectors',
        'Zero listing fees - you keep more of your earnings',
        'Built-in audience of crypto enthusiasts',
        'Easy inventory and order management',
        'Fast and secure payouts'
      ]
    },
    {
      icon: Video,
      title: 'Crypto Content Creators',
      description: 'Passionate about crypto and love creating content? Join us and help grow the BullRhun community through engaging videos, streams, and articles.',
      badge: 'Open Now',
      badgeColor: 'from-blue-500 to-cyan-500',
      features: [
        'Reach a highly engaged crypto audience',
        'Collaborate on BullRhun promotions and campaigns',
        'Monetize your content and community',
        'Access exclusive early product launches',
        'Grow your personal brand alongside ours'
      ]
    }
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Growing Platform',
      description: 'Join a rapidly expanding marketplace and community that\'s just getting started.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with crypto enthusiasts from around the world.'
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Built on Solana blockchain with transparent operations.'
    },
    {
      icon: Sparkles,
      title: 'Creative Freedom',
      description: 'Express yourself and build your brand your way.'
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
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join Our Team
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                    Careers & Partnerships
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                  We\'re looking for merch vendors and crypto content creators to join the BullRhun ecosystem.
                  Help us build the go-to destination for crypto commerce and community.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <a
                    href="https://x.com/bullrhun"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-5 h-5 mr-2" />
                    Contact Us on X
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* Why Work With Us */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">Why Join BullRhun?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Be part of something bigger. Join a platform that\'s reshaping crypto commerce and community engagement.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <Card
                    key={index}
                    className="hover:scale-[1.02] transition-all duration-300 border-primary/10 hover:border-primary/30"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="text-center mb-16">
                <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Partner Opportunities
                </Badge>
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">We're Looking For</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join our growing network of vendors and creators building the future of crypto commerce.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {roles.map((role, index) => (
                  <Card
                    key={index}
                    className="hover:scale-[1.02] transition-all duration-300 border-primary/10 hover:border-primary/30 shadow-lg hover:shadow-xl hover:shadow-primary/10"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                          <role.icon className="w-8 h-8 text-primary" />
                        </div>
                        <Badge className={`bg-gradient-to-r ${role.badgeColor} text-white border-0`}>
                          {role.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{role.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {role.description}
                      </p>
                      <ul className="space-y-3">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        <a
                          href="https://x.com/bullrhun"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Apply on X
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                    Ready to Join Us?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Whether you\'re a merch vendor, content creator, or just passionate about crypto,
                    we want to hear from you. Reach out on X and let\'s build something amazing together.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <a
                      href="https://x.com/bullrhun"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-5 h-5 mr-2" />
                      Contact Us on X
                    </a>
                  </Button>
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
