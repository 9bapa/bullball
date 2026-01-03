import { SharedHeader } from '@/components/layout/shared-header';
import { SharedFooter } from '@/components/layout/shared-footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-meme-dark text-white">
      <SharedHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">User Agreement</h2>
              <p className="text-gray-300 mb-4">
                By accessing and using BullRhun.com, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-gray-300">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Products and Services</h2>
              <p className="text-gray-300 mb-4">
                BullRhun.com offers merchandise, digital products, and related services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">User Accounts</h2>
              <p className="text-gray-300 mb-4">
                You are responsible for maintaining the confidentiality of your account and password. BullRhun.com is based in the USA and operates under US law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Refund Policy</h2>
              <p className="text-gray-300 mb-4 font-semibold text-red-400">
                <strong>All purchases are non-refundable.</strong>
              </p>
              <p className="text-gray-300">
                Once a purchase is made, no refunds will be issued under any circumstances. Please review your order carefully before completing your purchase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Payment Terms</h2>
              <p className="text-gray-300 mb-4">
                All payments are processed through Solana blockchain. You are responsible for any transaction fees associated with your payment method.
              </p>
              <p className="text-gray-300">
                Orders will be processed once payment is confirmed on the blockchain.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Intellectual Property</h2>
              <p className="text-gray-300 mb-4">
                All content, trademarks, service marks, trade names, logos, and products displayed on BullRhun.com are the property of BullRhun.com or their respective owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Limitation of Liability</h2>
              <p className="text-gray-300 mb-4">
                BullRhun.com shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Termination</h2>
              <p className="text-gray-300 mb-4">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Governing Law</h2>
              <p className="text-gray-300">
                These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Contact Information</h2>
              <p className="text-gray-300">
                Questions about the Terms of Service should be sent to legal@bullrhun.com
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <SharedFooter />
    </div>
  );
}