import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />

      <section className="pt-32 md:pt-36 lg:pt-40 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl mb-4 text-amber-400 font-semibold">Cookie Policy</h1>
            <p className="text-xl text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-5 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
              <p className="text-gray-300">This Cookie Policy explains how Swift Luxury GmbH ("Swift Luxury", "we", "our") uses cookies and similar technologies on our website and services. It should be read together with our Privacy Policy.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">2. What are cookies?</h2>
              <p className="text-gray-300">Cookies are small text files stored on your device by your browser. They allow websites to remember actions and preferences, enabling core functionality, performance measurement, and personalization.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">3. Types of cookies we use</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li><span className="font-semibold">Strictly necessary:</span> Required for essential site features such as security, network management, and accessibility.</li>
                <li><span className="font-semibold">Performance & analytics:</span> Help us understand how visitors use the site so we can improve content and usability.</li>
                <li><span className="font-semibold">Functionality:</span> Remember choices like language, currency, and preferences to provide a more personalized experience.</li>
                <li><span className="font-semibold">Advertising:</span> Used to deliver relevant adverts and measure campaign effectiveness. These may be set by our partners.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">4. Third‑party cookies</h2>
              <p className="text-gray-300">We may use trusted partners (e.g., analytics, ad networks, payment providers) that place cookies to provide services on our behalf. These parties are bound by contracts and process data in line with applicable laws.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">5. How you can manage cookies</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Most browsers let you block or delete cookies via settings. Doing so may affect site functionality.</li>
                <li>You can opt out of certain third‑party analytics or advertising cookies using their provided tools.</li>
                <li>Where legally required, we request consent for non‑essential cookies and honor your choices.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">6. Retention</h2>
              <p className="text-gray-300">Cookies are kept for periods that align with their purposes—for example, session cookies expire when you close your browser, while persistent cookies remain for a defined duration unless deleted.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">7. Changes to this policy</h2>
              <p className="text-gray-300">We may update this Cookie Policy to reflect changes in law or our practices. Updates will be posted here with a revised "Last updated" date.</p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 text-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
              <p className="text-gray-300">For questions about cookies or your preferences, contact us at support@swiftluxury.eu.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}





