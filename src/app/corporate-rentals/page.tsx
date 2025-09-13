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
            <h1 className="text-4xl md:text-6xl mb-6 text-amber-400 font-semibold">Corporate Rentals across Europe</h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">Travel for business, stay like home. Swift Luxury provides furnished corporate housing with prime locations, concierge‑level care, and flexible terms tailored to teams and executives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-left">
              <h3 className="text-white text-xl font-bold mb-2">Premium apartments</h3>
              <p className="text-gray-300">Design‑forward, fully furnished, and move‑in ready. Wi‑Fi, utilities, and essentials included.</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-left">
              <h3 className="text-white text-xl font-bold mb-2">Strategic locations</h3>
              <p className="text-gray-300">Central neighborhoods for quick access to business districts, airports, and transit.</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-left">
              <h3 className="text-white text-xl font-bold mb-2">Priority support</h3>
              <p className="text-gray-300">Dedicated account managers with fast turnarounds for changes, extensions, and group bookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Swift Luxury */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Swift Luxury for corporate housing?</h2>
            <p className="text-gray-400">A single partner for relocations, projects, and executive stays</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
              t:'Dedicated account manager', d:'One point of contact for requests, invoices, and reporting across cities.'
            },{
              t:'Flexible terms', d:'Extend or shorten stays with pro‑rated billing. Month‑to‑month options available.'
            },{
              t:'Group booking perks', d:'Volume pricing, consolidated deposits, and coordinated move‑ins for teams.'
            },{
              t:'Extra services', d:'Airport pickup, housekeeping, parking, and gym partnerships on request.'
            },{
              t:'Design‑led homes', d:'Multiple interior styles to match brand standards and personal preferences.'
            },{
              t:'Central coverage', d:'Berlin, Paris, Amsterdam, Vienna, Barcelona, London and more.'
            }].map((f, i) => (
              <div key={i} className="bg-black rounded-2xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">{f.t}</h3>
                <p className="text-gray-300 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Metrics */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[{n:'200+',l:'Corporate partners'}, {n:'1000+',l:'Guests booked'}, {n:'20%',l:'Average commissions'}, {n:'50+',l:'Countries served'}, {n:'3k+',l:'Nights last year'}, {n:'24/7',l:'Priority support'}].map((m,i)=>(
              <div key={i} className="bg-black rounded-2xl p-6 border border-gray-800">
                <div className="text-3xl font-bold text-amber-400">{m.n}</div>
                <div className="text-gray-400">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ snapshot */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Corporate FAQs</h2>
            <p className="text-gray-400">Straight answers for travel managers and HR teams</p>
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
              <div key={i} className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h3 className="text-white font-semibold mb-2">{f.q}</h3>
                <p className="text-gray-300">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-black rounded-3xl p-12 border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-6">Inquire about Corporate Rentals</h2>
            <p className="text-gray-300 mb-8 text-lg">Tell us your destination, dates, and team size—your dedicated account manager will respond within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl transition-colors">Contact Sales</a>
              <a href="/properties" className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl transition-colors backdrop-blur-sm">Browse Properties</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


