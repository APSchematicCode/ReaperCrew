import LegalPage from '@/components/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p className="text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
      <p className="text-gray-300">By using Reaper Crew's website and services, you agree to these Terms of Service.</p>
      <h2>1. Acceptance of Terms</h2>
      <p className="text-gray-300">By accessing this website, you agree to comply with and be bound by these terms. If you disagree, please do not use our site.</p>
      <h2>2. Products and Pricing</h2>
      <p className="text-gray-300">All products are subject to availability. Prices are subject to change without notice. We reserve the right to refuse or cancel orders.</p>
      <h2>3. Returns and Refunds</h2>
      <p className="text-gray-300">Please see our <a href="/returns" className="text-white hover:underline">Returns Policy</a> for details.</p>
      <h2>4. Limitation of Liability</h2>
      <p className="text-gray-300">Reaper Crew is not liable for any damages arising from the use of our products or services, to the fullest extent permitted by law.</p>
    </LegalPage>
  )
}