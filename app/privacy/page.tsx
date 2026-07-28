import LegalPage from '@/components/LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
      <p className="text-gray-300">
        Reaper Crew ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you visit our website or use our services.
      </p>
      <h2>1. Information We Collect</h2>
      <p className="text-gray-300">We collect information you provide directly, such as your name, email address, phone number, and payment details when you place an order or contact us.</p>
      <h2>2. How We Use Your Information</h2>
      <p className="text-gray-300">We use your information to process orders, send order confirmations, communicate with you, and improve our services.</p>
      <h2>3. Data Security</h2>
      <p className="text-gray-300">We implement industry-standard security measures to protect your data. However, no transmission over the internet is 100% secure.</p>
      <h2>4. Contact Us</h2>
      <p className="text-gray-300">If you have any questions about this Privacy Policy, please contact us via our <a href="/contact" className="text-white hover:underline">Contact page</a>.</p>
    </LegalPage>
  )
}