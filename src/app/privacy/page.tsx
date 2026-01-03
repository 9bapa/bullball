import { SharedHeader } from '@/components/layout/shared-header';
import { SharedFooter } from '@/components/layout/shared-footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-meme-dark text-white">
      <SharedHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Information We Collect</h2>
              <p className="text-gray-300 mb-4">
                BullRhun.com collects information you provide directly to us, such as when you create an account, make a purchase, or contact us.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Account information (name, email, wallet address)</li>
                <li>Shipping and billing information</li>
                <li>Order history and preferences</li>
                <li>Payment information (processed securely via Solana)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">How We Use Your Information</h2>
              <p className="text-gray-300 mb-4">
                We use the information we collect to provide, maintain, and improve our services.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support</li>
                <li>Send order updates and promotional emails</li>
                <li>Improve our website and products</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Information Sharing</h2>
              <p className="text-gray-300 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
              </p>
              <p className="text-gray-300">
                We may share information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing our users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Data Security</h2>
              <p className="text-gray-300">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at @x.com/bullrhun
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Policy Updates</h2>
              <p className="text-gray-300">
                This Privacy Policy was last updated on {new Date().toLocaleDateString()}. We may update this policy from time to time.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <SharedFooter />
    </div>
  );
}