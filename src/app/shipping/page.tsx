import { SharedHeader } from '@/components/layout/shared-header';
import { SharedFooter } from '@/components/layout/shared-footer';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-meme-dark text-white">
      <SharedHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Shipping Information</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Standard Shipping</h2>
              <p className="text-gray-300 mb-4">
                All items are shipped via standard shipping unless otherwise stated.
              </p>
              <div className="bg-meme-purple/20 border border-meme-purple/30 rounded-lg p-4 mb-4">
                <p className="text-meme-purple font-semibold">
                  Expected delivery time: <strong>3-7 business days</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Processing Time</h2>
              <p className="text-gray-300 mb-4">
                Orders are typically processed within 1-2 business days after payment confirmation.
              </p>
              <p className="text-gray-300">
                You will receive a confirmation email with tracking information once your order has been shipped.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Shipping Rates</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Standard Shipping</h3>
                  <p className="text-gray-300 mb-2">$5.99 + $0.50 per lb</p>
                  <p className="text-sm text-gray-400">Free shipping on orders over $50</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Rush Shipping</h3>
                  <p className="text-gray-300 mb-2">$12.99 + $1.00 per lb</p>
                  <p className="text-sm text-gray-400">Free shipping on orders over $75</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">International Shipping</h2>
              <p className="text-gray-300 mb-4">
                BullRhun.com is based in the USA and ships internationally. International shipping rates and delivery times vary by destination.
              </p>
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <p className="text-blue-300">
                  <strong>International Customers:</strong> Additional customs fees and import duties may apply and are the responsibility of the recipient.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Order Tracking</h2>
              <p className="text-gray-300 mb-4">
                Once your order ships, you will receive a tracking number via email. You can track your package using the provided tracking number.
              </p>
              <p className="text-gray-300">
                Tracking information is typically available within 24 hours of shipment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Shipping Address</h2>
              <p className="text-gray-300 mb-4">
                Please ensure your shipping address is correct at checkout. BullRhun.com is not responsible for orders shipped to incorrect addresses provided by the customer.
              </p>
              <p className="text-gray-300">
                Address changes after order processing may incur additional fees.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Package Security</h2>
              <p className="text-gray-300 mb-4">
                All packages are insured against loss or damage during transit. If your package arrives damaged or is lost, please contact us immediately.
              </p>
              <p className="text-gray-300">
                Photo evidence may be required for damage claims.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-meme-purple mb-4">Questions?</h2>
              <p className="text-gray-300">
                For shipping-related questions, please contact us at shipping@bullrhun.com
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <SharedFooter />
    </div>
  );
}