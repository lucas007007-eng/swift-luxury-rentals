import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />

      <section className="pt-32 md:pt-36 lg:pt-40 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl mb-4 text-amber-400 font-semibold">Privacy Policy</h1>
            <p className="text-xl text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-5 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">1. Who we are</h2>
              <p className="text-gray-300">This Privacy Policy explains how Swift Luxury GmbH (Germany) and Swift Luxury Ltd (England) (together, “Swift Luxury”, “we”, “us”) collect, use, share, and protect your data when you use our websites, apps, and services to browse, list, or book furnished rentals.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">2. Personal data we collect</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li><span className="font-semibold">Account & contact:</span> name, email, phone, password, communication preferences.</li>
                <li><span className="font-semibold">Identity & verification:</span> ID documents, date of birth, proof of stay purpose (work/study), where legally required.</li>
                <li><span className="font-semibold">Booking & payments:</span> stay details, invoices, payouts, payment status, and limited payment metadata (payments are processed by PCI‑compliant providers).</li>
                <li><span className="font-semibold">Usage & device:</span> log data, IP address, browser/OS, cookie identifiers, analytics and crash events.</li>
                <li><span className="font-semibold">Preferences & communications:</span> saved listings, search filters, messages with our team and partners.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">3. How we use your data</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Provide and improve the platform, listings, search, booking, and support experiences.</li>
                <li>Process bookings, payments, deposits, refunds, and generate contracts and invoices.</li>
                <li>Verify identity, prevent fraud and abuse, and comply with legal obligations (KYC/AML where applicable).</li>
                <li>Personalize content (e.g., saved searches), run analytics, and measure performance.</li>
                <li>Send important notices (service, security), and—where permitted—marketing communications.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">4. Legal bases (EEA/UK)</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li><span className="font-semibold">Contract:</span> to provide bookings, accounts, payments, and customer support.</li>
                <li><span className="font-semibold">Legitimate interests:</span> to secure our services, prevent fraud, improve features, and communicate essential updates.</li>
                <li><span className="font-semibold">Consent:</span> for non‑essential cookies/analytics and marketing where required—you can withdraw at any time.</li>
                <li><span className="font-semibold">Legal obligation:</span> financial reporting, tax/audit, KYC/AML and requests from authorities where applicable.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">5. Sharing your data</h2>
              <p className="text-gray-300">We share information with trusted providers who help us run our business—e.g., hosting, analytics, payments, ID verification, and customer support tools. Where you book or list properties, we share relevant details with the counterparties (e.g., landlord or guest) to fulfil the booking. All vendors are bound by agreements and process data only on our instructions.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">6. International transfers</h2>
              <p className="text-gray-300">Data may be processed outside your country. Where data moves from the EEA/UK to third countries, we rely on approved safeguards (e.g., adequacy decisions or Standard Contractual Clauses) and implement additional protections as needed.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">7. Retention</h2>
              <p className="text-gray-300">We keep data for as long as necessary for the purposes in this policy—typically for the life of your account and to comply with legal/accounting obligations. When no longer needed, data is securely deleted or anonymized.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">8. Your rights</h2>
              <p className="text-gray-300">Subject to local law (including GDPR/UK GDPR), you may have rights to access, correct, delete, restrict or object to processing, and data portability. You can also withdraw consent and lodge a complaint with your data protection authority. We will respond to verified requests within required timelines.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">9. Cookies</h2>
              <p className="text-gray-300">We use cookies and similar technologies for core functionality, analytics, and personalization. For details and controls, see our <a href="/cookie-policy" className="text-amber-400 hover:underline">Cookie Policy</a>.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">10. Security</h2>
              <p className="text-gray-300">We implement technical and organizational measures to protect personal data, including encryption in transit, access controls, and vendor diligence. No method is 100% secure; we continually improve our safeguards.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">11. Children’s privacy</h2>
              <p className="text-gray-300">Our services are not directed to children under 16. If we learn we have collected such data, we will delete it promptly.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">12. Changes to this policy</h2>
              <p className="text-gray-300">We may update this policy from time to time. Significant changes will be posted here with a revised "Last updated" date.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">13. Contact</h2>
              <p className="text-gray-300">For privacy queries: Swift Luxury GmbH, Berlin, Germany and Swift Luxury Ltd, London, England. Email: privacy@swiftluxury.eu</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}








