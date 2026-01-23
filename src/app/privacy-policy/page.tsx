import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Eye,
  Database,
  Lock,
  Share2,
  Cookie,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText
} from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Introduction',
      content: `
        BullRhun ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information when you use our
        platform and services.

        Please read this Privacy Policy carefully. By using BullRhun, you agree to the collection
        and use of information in accordance with this policy.
      `
    },
    {
      icon: Eye,
      title: 'Information We Collect',
      content: `
        We collect several types of information to provide and improve our services:

        1. Account Information: Name, email address, username, and password credentials
        2. Transaction Information: Purchase history, wallet addresses, payment details
        3. Activity Data: Browsing history, search queries, page interactions, and preferences
        4. Device Information: IP address, browser type, device type, operating system
        5. Location Data: Approximate location based on IP address (with consent)
        6. Communications: Messages, support tickets, and feedback you provide
        7. Blockchain Data: Public wallet addresses and transaction records (on-chain)

        We only collect information that is necessary for providing our services or that you
        voluntarily provide to us.
      `
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content: `
        We use your information for the following purposes:

        1. Service Delivery: Process transactions, manage your account, and provide customer support
        2. Security: Detect, prevent, and address fraud, security breaches, and malicious activities
        3. Personalization: Customize your experience, provide recommendations, and improve our services
        4. Communication: Send important updates, security alerts, and marketing communications (with consent)
        5. Analytics: Analyze usage patterns to understand trends and improve our platform
        6. Legal Compliance: Meet legal obligations, enforce our terms, and protect our rights

        We will not use your information for purposes beyond these stated uses without your consent.
      `
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: `
        We implement industry-standard security measures to protect your information:

        1. Encryption: Data is encrypted in transit and at rest using AES-256 encryption
        2. Access Controls: Strict access controls limit who can access your data
        3. Monitoring: Continuous monitoring for security threats and vulnerabilities
        4. Regular Audits: Regular security audits and penetration testing
        5. Secure Infrastructure: Hosted on secure, compliant cloud infrastructure

        However, no method of transmission over the Internet is 100% secure. While we strive to
        protect your information, we cannot guarantee absolute security.
      `
    },
    {
      icon: Share2,
      title: 'Information Sharing',
      content: `
        We do not sell your personal information. We may share your information only in the following
        circumstances:

        1. Service Providers: With trusted third-party service providers who assist our operations
        2. Legal Requirements: When required by law, court order, or government authority
        3. Business Transfers: In connection with a merger, acquisition, or sale of assets
        4. Protection: To protect our rights, property, safety, or the safety of our users
        5. With Consent: When you have given us explicit consent to share your information

        Blockchain transaction data is public and cannot be kept private. This includes wallet
        addresses and transaction histories recorded on-chain.
      `
    },
    {
      icon: Cookie,
      title: 'Cookies and Tracking Technologies',
      content: `
        We use cookies and similar technologies to enhance your experience:

        1. Essential Cookies: Required for basic functionality and security
        2. Analytics Cookies: Help us understand how users interact with our platform
        3. Preference Cookies: Remember your settings and preferences
        4. Marketing Cookies: Track engagement with marketing content (with consent)

        You can manage your cookie preferences through your browser settings. Please note that
        disabling certain cookies may affect your ability to use some features of our platform.
      `
    },
    {
      icon: Eye,
      title: 'Your Privacy Rights',
      content: `
        Depending on your location, you may have the following rights:

        1. Access: Request access to your personal information
        2. Correction: Request correction of inaccurate information
        3. Deletion: Request deletion of your personal information (with limitations)
        4. Portability: Request transfer of your data to another service
        5. Objection: Object to certain processing of your information
        6. Withdraw Consent: Withdraw consent for marketing communications

        To exercise these rights, please contact our privacy team through the contact information
        provided below.
      `
    },
    {
      icon: Database,
      title: 'Data Retention',
      content: `
        We retain your information for as long as necessary to provide our services and fulfill
        the purposes outlined in this policy:

        1. Active Accounts: Information is retained while your account is active
        2. Legal Requirements: Some data must be retained to comply with legal obligations
        3. Transactions: Transaction records may be retained for business and legal purposes
        4. Deleted Accounts: Data is securely deleted or anonymized within 30 days of account deletion

        Blockchain data cannot be deleted once recorded on-chain, as it is part of the public ledger.
      `
    },
    {
      icon: Shield,
      title: "Children's Privacy",
      content: `
        Our services are not intended for individuals under the age of 18. We do not knowingly
        collect personal information from children under 18.

        If we discover that we have collected information from a child under 18, we will take
        immediate steps to delete such information.

        Parents and guardians should monitor their children's internet use and ensure they do
        not provide personal information on our platform.
      `
    },
    {
      icon: AlertCircle,
      title: 'International Data Transfers',
      content: `
        Your information may be transferred to and processed in countries other than your country
        of residence. These countries may have different data protection laws.

        When we transfer your information internationally, we ensure appropriate safeguards are
        in place to protect your privacy and data rights, such as:
        1. Standard Contractual Clauses approved by relevant authorities
        2. Compliance with applicable international data transfer frameworks
        3. Contractual commitments from third-party service providers
      `
    },
    {
      icon: FileText,
      title: 'Changes to This Policy',
      content: `
        We may update this Privacy Policy from time to time to reflect changes in our practices,
        applicable laws, or for other operational reasons.

        We will notify users of material changes through:
        1. Email notification
        2. In-platform notifications
        3. Posting on our website

        Your continued use of our services after changes to this policy constitutes your acceptance
        of the updated policy.
      `
    },
    {
      icon: Info,
      title: 'Contact Information',
      content: `
        If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
        please contact us:

        Email: privacy@bullrhun.com
        Address: BullRhun Privacy Team
        Website: www.bullrhun.com

        We will respond to your inquiries within 30 days of receipt.
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
                <Shield className="w-4 h-4 mr-2" />
                Your Privacy Matters
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                  Privacy Policy
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Learn how we protect your personal information and data.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026
              </p>
            </div>
          </div>
        </section>

        {/* Key Principles */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/10 bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                    <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                    Secure & Protected
                  </h3>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    Industry-standard encryption and security measures
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Transparent
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Clear disclosure of data collection and usage
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    User Control
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Full control over your personal information
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
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
                  Your Privacy, Our Priority
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  We're committed to protecting your personal information. If you have any
                  questions about our privacy practices, please reach out to us.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                  >
                    Start Using BullRhun
                  </a>
                  <a
                    href="/about"
                    className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-primary/20 text-primary font-semibold hover:bg-primary/5 hover:scale-105 transition-all"
                  >
                    Learn More About Us
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
                      <MobileBottomNav />
      
    </div>
  )
}
