import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { HomeModernIcon, CurrencyEuroIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

export default function ListYourProperty() {
  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />

      {/* Hero */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl mb-6 text-amber-400 font-semibold">Property management across Europe</h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">Guaranteed rent, zero vacancies, and premium tenant selection. Swift Luxury makes ownership effortless—and profitable.</p>
            <div className="mt-6">
              <a href="/contact" className="inline-block border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold px-8 py-3 rounded-xl transition-colors">Contact us</a>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord benefits by the numbers */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[{n:'100%',l:'Market‑average income'},{n:'15%',l:'Re‑rental cost savings'},{n:'7–10 yrs',l:'Avg. lease length'},{n:'0',l:'Vacancy months'},{n:'48h',l:'Issue response'},{n:'A+',l:'Tenant screening'}].map((m,i)=>(
              <div key={i} className="bg-black rounded-2xl p-6 border border-gray-800">
                <div className="text-3xl font-bold text-amber-400">{m.n}</div>
                <div className="text-gray-400">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care for your home */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-3xl font-bold text-white mb-4">We care for your home like it’s our own</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Regular quality inspections and transparent, streamlined communication.</li>
                <li>Tenant vetting with background checks; strong corporate and multinational demand.</li>
                <li>Meticulous maintenance and scheduled cleaning to keep homes pristine.</li>
              </ul>
            </div>
            <div className="bg-black rounded-2xl p-8 border border-gray-800 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                <HomeModernIcon className="w-24 h-24 text-amber-400 twinkle-slow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guaranteed rent */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-black rounded-2xl p-8 border border-gray-800 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                <CurrencyEuroIcon className="w-24 h-24 text-amber-400 twinkle-slow" />
              </div>
            </div>
            <div className="bg-black rounded-2xl p-8 border border-gray-800">
              <h2 className="text-3xl font-bold text-white mb-4">Guaranteed rent. No vacancies. No stress.</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Stable, on‑time payments every month—no income gaps.</li>
                <li>No broker fees or marketing costs. We handle demand generation.</li>
                <li>100% occupancy guaranteed—paid whether the home is rented or not.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Property management */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-3xl font-bold text-white mb-4">We handle management, so you don’t have to</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>We cover leasing, tenant acquisition, maintenance, and guest services.</li>
                <li>Damage‑mitigation standards and responsive in‑house operations.</li>
                <li>Value‑add improvements to elevate appeal and long‑term returns.</li>
              </ul>
            </div>
            <div className="bg-black rounded-2xl p-8 border border-gray-800 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-24 h-24 text-amber-400 twinkle-slow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">A partnership built on performance and care</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              t:'Free Property Evaluation', d:'Our experts assess the home for quality and location, then provide an income proposal, terms, and a full management plan.'
            },{
              t:'Effortless Setup', d:'We furnish and optimize with in‑house designers at no cost. The apartment becomes fully equipped and guest‑ready.'
            },{
              t:'Guaranteed Rent & Care', d:'We lease, manage, and maintain. With ongoing inspections and premium care, your property stays pristine.'
            }].map((s,i)=>(
              <div key={i} className="bg-black rounded-2xl p-8 border border-gray-800">
                <div className="bg-amber-500 text-black rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">{i+1}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.t}</h3>
                <p className="text-gray-300 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-900 rounded-3xl p-12 border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-6">Your property, endless possibilities</h2>
            <p className="text-gray-300 mb-8 text-lg">Speak with our owners team to see income projections, contract options, and the setup plan for your home.</p>
            <a href="/contact" className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl transition-colors">Contact us</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


