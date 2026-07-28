import LegalPage from '@/components/LegalPage'

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns Policy">
      <p className="text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
      <p className="text-gray-300">We want you to be completely satisfied with your Reaper Crew purchase. If you are not, here is our return policy.</p>
      <h2>1. Returns</h2>
      <p className="text-gray-300">You have 30 days from the date of delivery to request a return. Items must be unused, in original packaging, and in the same condition as received.</p>
      <h2>2. Return Process</h2>
      <p className="text-gray-300">To initiate a return, please contact us through our <a href="/contact" className="text-white hover:underline">Contact page</a> with your order number and reason for return. We will provide you with a return shipping address.</p>
      <h2>3. Refunds</h2>
      <p className="text-gray-300">Once we receive and inspect your return, we will process a refund to your original payment method within 5-7 business days. Shipping costs are non-refundable.</p>
      <h2>4. Exchanges</h2>
      <p className="text-gray-300">If you need a different size or variant, please return the original item and place a new order.</p>
    </LegalPage>
  )
}