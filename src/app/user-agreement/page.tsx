import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Scale,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
  FileText
} from 'lucide-react'

export default function UserAgreementPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Introduction',
      content: `
        Welcome to BullRhun ("we," "our," or "us"). By accessing or using our platform, services, or website,
        you agree to be bound by these Terms of Service ("Terms"). Please read them carefully as they govern
        your use of our services.

        BullRhun is a platform for buying, selling, and trading crypto trading cards and digital collectibles.
        Our platform leverages blockchain technology to provide secure, transparent, and innovative
        collecting experiences.
      `
    },
    {
      icon: Scale,
      title: 'Acceptance of Terms',
      content: `
        By creating an account, accessing our platform, or using our services, you acknowledge that you have
        read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must
        not access or use our services.

        We reserve the right to modify these Terms at any time. We will notify users of material changes
        through our platform or by email. Your continued use of our services after such modifications constitutes
        your acceptance of the updated Terms.
      `
    },
    {
      icon: Shield,
      title: 'Account Registration and Security',
      content: `
        To access certain features of our platform, you must create an account. You agree to:

        1. Provide accurate, current, and complete information during registration
        2. Maintain and promptly update your account information
        3. Keep your password and account credentials secure
        4. Accept responsibility for all activities under your account
        5. Notify us immediately of any unauthorized use or security breach

        You are responsible for maintaining the confidentiality of your account credentials and for all
        activities that occur under your account. BullRhun is not liable for any loss or damage arising
        from your failure to comply with these security obligations.
      `
    },
    {
      icon: AlertCircle,
      title: 'Eligibility',
      content: `
        You must be at least 18 years old or the legal age of majority in your jurisdiction to use our services.
        By using our platform, you represent and warrant that you meet this eligibility requirement.

        Access to our services may be restricted in certain jurisdictions due to local laws and regulations.
        It is your responsibility to ensure that your use of our services complies with applicable laws.
      `
    },
    {
      icon: CheckCircle2,
      title: 'Acceptable Use Policy',
      content: `
        You agree to use our platform only for lawful purposes and in accordance with these Terms.
        You must not:

        1. Use our services for any illegal purpose or in violation of any applicable laws
        2. Impersonate any person or entity or misrepresent your affiliation
        3. Interfere with or disrupt our services or servers
        4. Attempt to gain unauthorized access to our systems or data
        5. Use automated tools to access our platform without permission
        6. Upload or transmit malicious code, viruses, or other harmful content
        7. Engage in fraudulent activities, money laundering, or other financial crimes
        8. Violate the intellectual property rights of others
        9. Harass, abuse, or harm other users

        We reserve the right to suspend or terminate accounts that violate these policies.
      `
    },
    {
      icon: Scale,
      title: 'Buying and Selling',
      content: `
        BullRhun provides a marketplace for trading crypto collectibles. By using our trading services,
        you agree to:

        1. Provide accurate descriptions and information for items you list
        2. Fulfill all orders and transactions you accept
        3. Pay all applicable fees and charges as outlined in our fee schedule
        4. Comply with all applicable laws regarding digital asset transactions
        5. Understand that blockchain transactions are irreversible once confirmed

        We act as a marketplace and do not take ownership of items listed. Sellers are solely responsible
        for the items they list and their fulfillment obligations.
      `
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: `
        All content on our platform, including but not limited to text, graphics, logos, images, software,
        and code, is owned by BullRhun or its licensors and protected by intellectual property laws.

        You may not copy, modify, distribute, or create derivative works of our content without express
        written permission.

        Users retain ownership of the crypto collectibles they purchase. However, by using our platform,
        you grant us a limited license to display and promote your listings in connection with our services.
      `
    },
    {
      icon: AlertCircle,
      title: 'Disclaimer of Warranties',
      content: `
        Our services are provided "as is" and "as available" without warranties of any kind, whether express
        or implied. We disclaim all warranties, including but not limited to:

        1. Merchantability and fitness for a particular purpose
        2. Non-infringement of third-party rights
        3. Accuracy, reliability, or availability of our services
        4. Security or uninterrupted operation of our platform

        We do not guarantee that our platform will be error-free, secure, or that defects will be corrected.
      `
    },
    {
      icon: AlertCircle,
      title: 'Limitation of Liability',
      content: `
        To the maximum extent permitted by law, BullRhun shall not be liable for:

        1. Indirect, incidental, special, consequential, or punitive damages
        2. Loss of profits, data, business, or goodwill
        3. Any damages exceeding the amount you paid to us in the past 12 months

        Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability,
        so some of these limitations may not apply to you.
      `
    },
    {
      icon: Clock,
      title: 'Termination',
      content: `
        We reserve the right to suspend or terminate your account and access to our services at any time,
        with or without cause, with or without notice.

        Upon termination:
        1. Your right to use our services will immediately cease
        2. We may delete your account data and information
        3. Any remaining balances or credits may be forfeited
        4. You remain liable for any obligations incurred prior to termination

        You may also terminate your account at any time by contacting our support team.
      `
    },
    {
      icon: Info,
      title: 'Governing Law and Dispute Resolution',
      content: `
        These Terms shall be governed by and construed in accordance with applicable laws.
        Any disputes arising from or relating to these Terms shall be resolved through binding arbitration,
        except where prohibited by law.

        You agree to waive your right to a trial by jury and to participate in class action lawsuits
        or class-wide arbitration against BullRhun.
      `
    },
    {
      icon: FileText,
      title: 'Indemnification',
      content: `
        You agree to indemnify, defend, and hold harmless BullRhun and its affiliates, officers, directors,
        employees, and agents from and against any claims, liabilities, damages, losses, and expenses,
        including legal fees, arising from:

        1. Your use or misuse of our services
        2. Your violation of these Terms
        3. Your violation of any third-party rights
        4. Your violation of applicable laws or regulations
      `
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <FileText className="w-4 h-4 mr-2" />
                Legal Documentation
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                  User Agreement
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Please read these terms carefully before using our platform.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026
              </p>
            </div>
          </div>
        </section>

        {/* Warning Notice */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="shrink-0 p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Please Read Carefully
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    This User Agreement is a legally binding contract between you and BullRhun.
                    By accessing or using our platform, you agree to be bound by these terms.
                    If you do not agree with any part of this agreement, you must not use our services.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-8 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <Card
                    key={index}
                    className="border-primary/10 hover:border-primary/20 transition-colors shadow-lg hover:shadow-xl hover:shadow-primary/5"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-mono text-primary border-primary/30">
                            Section {index + 1}
                          </Badge>
                          <h2 className="text-2xl font-bold">{section.title}</h2>
                        </div>
                      </div>
                      <div className="pl-0 lg:pl-16">
                        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl" />
              </div>

              <CardContent className="relative p-12 text-center">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  By creating an account and using BullRhun, you agree to these User Agreement terms.
                  Join our community of collectors today!
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                  >
                    Create Account
                  </a>
                  <a
                    href="/about"
                    className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-primary/20 text-primary font-semibold hover:bg-primary/5 hover:scale-105 transition-all"
                  >
                    Learn More
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
