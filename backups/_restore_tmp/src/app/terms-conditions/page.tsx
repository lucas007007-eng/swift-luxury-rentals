import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsConditions() {
  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl mb-4 text-amber-400 font-semibold">Terms & Conditions</h1>
            <p className="text-xl text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-5 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
              <p className="text-gray-300">These Terms and Conditions (the “Terms”) govern your use of Swift Luxury’s platform and services for discovering and booking furnished rentals (the “Services”). By using the Services, you agree to these Terms.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">2. Parties</h2>
              <p className="text-gray-300">“Swift Luxury”, “we”, “us”, or “our” refers to Swift Luxury GmbH. “You” or “Guest” refers to the user accessing or using our Services.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">3. Booking and Payments</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Requests are reviewed for eligibility and compliance. Bookings are confirmed only after approval.</li>
                <li>Card payments are authorized but not captured until confirmation. Crypto payments may be held in escrow until approval, then released or refunded automatically if not approved.</li>
                <li>Damage deposits may be required and are refundable subject to post‑stay inspection.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">4. Cancellations and Refunds</h2>
              <p className="text-gray-300">Cancellation, modification and refund eligibility depend on the listing policy and applicable local laws. Where applicable, fees already incurred (e.g., bank/processing fees) may be non‑refundable.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">5. Guest Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Use the accommodation responsibly, comply with house rules, building regulations, and local laws.</li>
                <li>No unauthorized parties, subletting, or commercial use without written consent.</li>
                <li>Report damages promptly; excessive damage or policy violations may forfeit part or all of the deposit and may incur additional charges.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">6. Listing Content and Availability</h2>
              <p className="text-gray-300">Photos, amenities, and availability are provided in good faith. Minor variations can occur due to maintenance or building management requirements. We reserve the right to substitute comparable accommodations if necessary, with a refund option if unsuitable.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">7. Compliance and Verification</h2>
              <p className="text-gray-300">For fraud prevention and legal compliance, we may require identity verification and documentation (e.g., purpose of stay, employment, or study records) and may deny service where requirements are not met.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">8. Liability</h2>
              <p className="text-gray-300">To the maximum extent permitted by law, Swift Luxury is not liable for indirect, incidental, or consequential damages. Our aggregate liability will not exceed the total fees you paid to Swift Luxury for the booking at issue.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">9. Privacy</h2>
              <p className="text-gray-300">Your personal data is processed in accordance with our Privacy Policy. By using our Services, you consent to such processing.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">10. Governing Law and Disputes</h2>
              <p className="text-gray-300">These Terms are governed by the laws of Germany. Courts of Berlin shall have exclusive jurisdiction, unless mandatory consumer protections specify otherwise.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">11. Changes</h2>
              <p className="text-gray-300">We may update these Terms from time to time. Material changes will be communicated on this page with an updated “Last updated” date.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">12. Contact</h2>
              <p className="text-gray-300">Swift Luxury GmbH, Berlin, Germany. For questions, contact us at support@swiftluxury.eu.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}


