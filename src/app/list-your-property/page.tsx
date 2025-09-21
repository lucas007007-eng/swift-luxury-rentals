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
            <h1 className="text-4xl md:text-6xl mb-6 text-white font-sora font-bold">Property Management across Europe</h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">Guaranteed rent, zero vacancies, and premium tenant selection. Swift Luxury makes ownership effortless—and profitable.</p>
            <div className="mt-6">
              <a href="/contact" className="luxury-badge px-8 py-4 text-lg font-bold hover:transform hover:-translate-y-1">Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord benefits by the numbers */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[{n:'100%',l:'Market‑average income'},{n:'15%',l:'Re‑rental cost savings'},{n:'7–10 yrs',l:'Avg. lease length'},{n:'0',l:'Vacancy months'},{n:'48h',l:'Issue response'},{n:'A+',l:'Tenant screening'}].map((m,i)=>(
              <div key={i} className="luxury-feature-card">
                <div className="text-3xl font-bold text-white font-sora mb-2">{m.n}</div>
                <div className="text-gray-300 font-medium">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care for your home */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="luxury-feature-card text-left border-2 border-gray-300/20">
              <h2 className="text-3xl font-bold text-white mb-6 font-sora">We care for your home like it's our own</h2>
              <div className="luxury-badge mb-4">Premium Care</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Regular quality inspections and transparent, streamlined communication.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Tenant vetting with background checks; strong corporate and multinational demand.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Meticulous maintenance and scheduled cleaning to keep homes pristine.</span>
                </li>
              </ul>
            </div>
            <div className="luxury-feature-card flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="url(#silverGradient)" stroke="url(#silverBorder)" strokeWidth="2"/>
                <circle cx="50" cy="50" r="35" fill="#1a1a1a" stroke="url(#silverInner)" strokeWidth="1"/>
                <path d="M30 45h40v20H55v10h-10V65H30V45z M35 35L50 20l15 15H35z" fill="url(#silverInner)"/>
                <defs>
                  <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5E7EB"/>
                    <stop offset="50%" stopColor="#D1D5DB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                  <linearGradient id="silverBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                  <linearGradient id="silverInner" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB"/>
                    <stop offset="50%" stopColor="#E5E7EB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Guaranteed rent */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="luxury-feature-card flex items-center justify-center shadow-[0_0_30px_rgba(192,192,192,0.1)]">
              <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="url(#euroGradient)" stroke="url(#euroBorder)" strokeWidth="2"/>
                <circle cx="50" cy="50" r="35" fill="#1a1a1a" stroke="url(#euroInner)" strokeWidth="1"/>
                <path d="M35 35c0-8 6-14 14-14s14 6 14 14M35 50h20M35 65c0 8 6 14 14 14s14-6 14-14" 
                      stroke="url(#euroInner)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="euroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5E7EB"/>
                    <stop offset="50%" stopColor="#D1D5DB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                  <linearGradient id="euroBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                  <linearGradient id="euroInner" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB"/>
                    <stop offset="50%" stopColor="#E5E7EB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="luxury-feature-card text-left border border-gray-400/30">
              <h2 className="text-3xl font-bold text-white mb-6 font-sora">Guaranteed rent. No vacancies. No stress.</h2>
              <div className="luxury-badge mb-4">Zero Risk</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Stable, on‑time payments every month—no income gaps.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>No broker fees or marketing costs. We handle demand generation.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>100% occupancy guaranteed—paid whether the home is rented or not.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Property management */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="luxury-feature-card text-left bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <h2 className="text-3xl font-bold text-white mb-6 font-sora">We handle management, so you don't have to</h2>
              <div className="luxury-badge mb-4">Full Service</div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>We cover leasing, tenant acquisition, maintenance, and guest services.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Damage‑mitigation standards and responsive in‑house operations.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Value‑add improvements to elevate appeal and long‑term returns.</span>
                </li>
              </ul>
            </div>
            <div className="luxury-feature-card flex items-center justify-center border-2 border-gray-300/20">
              <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="url(#toolGradient)" stroke="url(#toolBorder)" strokeWidth="2"/>
                <circle cx="50" cy="50" r="35" fill="#1a1a1a" stroke="url(#toolInner)" strokeWidth="1"/>
                <path d="M35 40h30v5H35z M45 25v50 M55 25v50" stroke="url(#toolInner)" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="45" cy="30" r="3" fill="url(#toolInner)"/>
                <circle cx="55" cy="30" r="3" fill="url(#toolInner)"/>
                <defs>
                  <linearGradient id="toolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5E7EB"/>
                    <stop offset="50%" stopColor="#D1D5DB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                  <linearGradient id="toolBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                  <linearGradient id="toolInner" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB"/>
                    <stop offset="50%" stopColor="#E5E7EB"/>
                    <stop offset="100%" stopColor="#9CA3AF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 font-sora">How It Works</h2>
            <p className="text-gray-300">A partnership built on performance and care</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              t:'Free Property Evaluation', d:'Our experts assess the home for quality and location, then provide an income proposal, terms, and a full management plan.', variant: 'luxury-feature-card'
            },{
              t:'Effortless Setup', d:'We furnish and optimize with in‑house designers at no cost. The apartment becomes fully equipped and guest‑ready.', variant: 'luxury-feature-card border border-gray-400/30'
            },{
              t:'Guaranteed Rent & Care', d:'We lease, manage, and maintain. With ongoing inspections and premium care, your property stays pristine.', variant: 'luxury-feature-card shadow-[0_0_30px_rgba(192,192,192,0.1)]'
            }].map((s,i)=>(
              <div key={i} className={s.variant}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-400 text-black flex items-center justify-center font-bold text-lg mb-6 mx-auto">{i+1}</div>
                <h3 className="text-xl font-bold text-white mb-4 font-sora">{s.t}</h3>
                <p className="text-gray-300 leading-relaxed">{s.d}</p>
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
              <h2 className="text-3xl font-bold text-white mb-6 font-sora">Your property, endless possibilities</h2>
              <p className="text-gray-300 mb-8 text-lg">Speak with our owners team to see income projections, contract options, and the setup plan for your home.</p>
              <a href="/contact" className="luxury-badge px-8 py-4 text-lg font-bold hover:transform hover:-translate-y-1">Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


