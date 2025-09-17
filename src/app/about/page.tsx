'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  const [overrides, setOverrides] = React.useState<Record<string,string>>({})
  React.useEffect(() => {
    ;(async()=>{
      try {
        const res = await fetch('/api/pages/about', { cache: 'no-store' })
        const data = await res.json()
        const o = data?.page?.contentOverrides || {}
        setOverrides(o)
      } catch {}
    })()
  }, [])
  const values = [
    {
      icon: '🏆',
      title: 'Excellence',
      description: 'We curate only the finest luxury properties across Europe\'s most prestigious neighborhoods.'
    },
    {
      icon: '🔒',
      title: 'Security',
      description: 'Advanced payment security with cryptocurrency integration and traditional banking compliance.'
    },
    {
      icon: '⚡',
      title: 'Innovation',
      description: 'Revolutionary crypto payment solutions that make luxury rentals accessible to the digital age.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Transparent processes and dedicated support ensure a stress-free luxury rental experience.'
    }
  ]

  const features = [
    {
      title: 'Cryptocurrency Payments',
      description: 'The first platform to accept Bitcoin, Ethereum, and USDT for luxury rental payments.',
      icon: '₿'
    },
    {
      title: 'European Expansion',
      description: 'Luxury properties in Berlin, Paris, Amsterdam, Vienna, Barcelona, and London.',
      icon: '🌍'
    },
    {
      title: 'Premium Service',
      description: '24/7 support, tenant protection, and concierge-level customer service.',
      icon: '⭐'
    },
    {
      title: 'Verified Properties',
      description: 'Every property is personally verified and meets our strict luxury standards.',
      icon: '✅'
    }
  ]

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 
              className="text-4xl md:text-6xl mb-6 text-amber-400 font-semibold"
            >
              About Swift Luxury
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              {overrides['hero.subtitle'] || 'Revolutionizing luxury rentals across Europe with cryptocurrency payments and premium service'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {overrides['mission.body'] || `Swift Luxury is pioneering the future of luxury rentals by combining premium European properties with cutting-edge cryptocurrency payment solutions. We believe luxury living should be accessible and payments should be seamless.`}
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                {overrides['mission.body.2'] || `Our platform connects discerning travelers and long-term residents with Europe's finest rental properties, offering unparalleled convenience through our revolutionary crypto payment system.`}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                <div className="bg-amber-500/20 rounded-2xl p-6 border border-amber-500/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Why Swift Luxury?</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-black font-bold text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">First crypto-enabled luxury rental platform</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-black font-bold text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">Curated luxury properties €6,500+/month</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-black font-bold text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">Architect-designed properties available</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {overrides['values.intro'] || 'The principles that guide everything we do at Swift Luxury'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-black rounded-2xl p-8 border border-gray-800 hover:border-amber-400/50 transition-colors"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {overrides['features.intro'] || 'Revolutionary features that set Swift Luxury apart from traditional rental platforms'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800"
              >
                <div className="flex items-start space-x-6">
                  <div className="bg-amber-500/20 rounded-full w-16 h-16 flex items-center justify-center text-2xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-black rounded-3xl p-12 border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Experience Swift Luxury?</h2>
            <p className="text-gray-300 mb-8 text-lg">
              {overrides['cta.subtitle'] || 'Discover our curated collection of ultra-luxury properties across Europe'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl transition-colors text-center">
                Browse Properties
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl transition-colors backdrop-blur-sm text-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}