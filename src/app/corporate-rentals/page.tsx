import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CorporateRentalsPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />

      {/* Hero */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl mb-6 text-white font-sora font-bold">Corporate Rentals across Europe</h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">Travel for business, stay like home. Swift Luxury provides furnished corporate housing with prime locations, concierge‑level care, and flexible terms tailored to teams and executives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="luxury-feature-card text-left">
              <h3 className="text-white text-xl font-bold mb-3 font-sora">Premium Apartments</h3>
              <div className="luxury-badge mb-4">Executive Ready</div>
              <p className="text-gray-300 leading-relaxed">Design‑forward, fully furnished, and move‑in ready. Wi‑Fi, utilities, and essentials included.</p>
            </div>
            <div className="luxury-feature-card text-left">
              <h3 className="text-white text-xl font-bold mb-3 font-sora">Strategic Locations</h3>
              <div className="luxury-badge mb-4">Prime Districts</div>
              <p className="text-gray-300 leading-relaxed">Central neighborhoods for quick access to business districts, airports, and transit.</p>
            </div>
            <div className="luxury-feature-card text-left">
              <h3 className="text-white text-xl font-bold mb-3 font-sora">Priority Support</h3>
              <div className="luxury-badge mb-4">24/7 Concierge</div>
              <p className="text-gray-300 leading-relaxed">Dedicated account managers with fast turnarounds for changes, extensions, and group bookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Swift Luxury */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 font-sora">Why Swift Luxury for corporate housing?</h2>
            <p className="text-gray-300">A single partner for relocations, projects, and executive stays</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
              t:'Dedicated Account Manager', d:'One point of contact for requests, invoices, and reporting across cities.'
            },{
              t:'Flexible Terms', d:'Extend or shorten stays with pro‑rated billing. Month‑to‑month options available.'
            },{
              t:'Group Booking Perks', d:'Volume pricing, consolidated deposits, and coordinated move‑ins for teams.'
            },{
              t:'Extra Services', d:'Airport pickup, housekeeping, parking, and gym partnerships on request.'
            },{
              t:'Design‑Led Homes', d:'Multiple interior styles to match brand standards and personal preferences.'
            },{
              t:'Central Coverage', d:'Berlin, Paris, Amsterdam, Vienna, Barcelona, London and more.'
            }].map((f, i) => (
              <div key={i} className="luxury-feature-card text-left">
                <h3 className="text-xl font-bold text-white mb-3 font-sora">{f.t}</h3>
                <p className="text-gray-300 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Metrics */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[{n:'200+',l:'Corporate partners'}, {n:'1000+',l:'Guests booked'}, {n:'20%',l:'Average commissions'}, {n:'50+',l:'Countries served'}, {n:'3k+',l:'Nights last year'}, {n:'24/7',l:'Priority support'}].map((m,i)=>(
              <div key={i} className="luxury-feature-card">
                <div className="text-3xl font-bold text-white font-sora mb-2">{m.n}</div>
                <div className="text-gray-300 font-medium">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ snapshot */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 font-sora">Corporate FAQs</h2>
            <p className="text-gray-300">Straight answers for travel managers and HR teams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {q:'How does billing work for corporate clients?',a:'Centralized invoices with monthly statements; split billing available on request.'},
              {q:'Can we extend stays?',a:'Yes—flexible extensions with pro‑rata pricing subject to availability.'},
              {q:'Do apartments include workspaces?',a:'Most units include dedicated work areas; we can prioritize this in selection.'},
              {q:'Do you offer parking?',a:'Parking can be arranged in many buildings or nearby partners.'},
              {q:'Can employees be housed in the same area?',a:'We can cluster units within the same neighborhood for team proximity.'},
              {q:'Do you provide cleaning services?',a:'Regular housekeeping can be scheduled; frequency customized per client.'},
            ].map((f,i)=>(
              <div key={i} className="luxury-feature-card text-left">
                <h3 className="text-white font-semibold mb-3 font-sora">{f.q}</h3>
                <p className="text-gray-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="spy-cta-section rounded-3xl border border-gray-400/40 bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#000000] p-12 shadow-[0_0_40px_rgba(192,192,192,0.15)]">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6 font-sora">Inquire about Corporate Rentals</h2>
              <p className="text-gray-300 mb-8 text-lg">Tell us your destination, dates, and team size—your dedicated account manager will respond within 24 hours.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-2 border-yellow-400 hover:from-yellow-300 hover:to-yellow-400 transition-all hover:transform hover:-translate-y-1">Contact Sales</a>
                <a href="/properties" className="px-8 py-4 text-lg font-bold rounded-xl bg-transparent hover:bg-gray-800/50 text-white border-2 border-gray-400 hover:border-gray-300 transition-all">Browse Properties</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


