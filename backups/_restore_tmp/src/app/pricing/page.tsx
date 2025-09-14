'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, ShieldCheckIcon, CreditCardIcon, HomeIcon } from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PricingPage() {
  const pricingSteps = [
    {
      step: 1,
      title: 'Search Fast, Search Smart',
      description: 'Browse through hundreds of luxury properties across Europe. Save your favorites and create search alerts so you don\'t miss your dream place.',
      cost: 'Free',
      features: ['Browse luxury properties', 'Save favorites', 'Search alerts', 'Property comparisons']
    },
    {
      step: 2,
      title: 'Chat with Verified Landlords',
      description: 'Connect directly with verified property owners. Ask questions, discuss details, and negotiate terms for your luxury rental.',
      cost: 'Free',
      features: ['Direct landlord contact', 'Verified property owners', 'Real-time messaging', 'Secure communication']
    },
    {
      step: 3,
      title: 'Book and Pay Securely',
      description: 'Swift Luxury charges a one-time Tenant Protection fee of 25%-40% of the first month\'s rent (minimum €175). We protect your payment until move-in.',
      cost: 'Tenant Protection Fee',
      features: ['Secure payment processing', 'Crypto & card payments', '48-hour protection', 'Full refund guarantee']
    },
    {
      step: 4,
      title: 'Move In with Confidence',
      description: 'Pay your deposit and monthly rent through our secure system. Multiple payment methods accepted including cryptocurrency.',
      cost: '2.5% Service Fee',
      features: ['Multiple payment methods', 'Crypto payments', 'Monthly rent collection', 'Transparent invoicing']
    }
  ]

  const protectionFeatures = [
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-amber-400" />,
      title: 'Stress-Free Move-In',
      description: 'If the landlord cancels last minute or delays your move-in, we\'ll help you find another place or provide temporary accommodation.'
    },
    {
      icon: <CreditCardIcon className="w-8 h-8 text-amber-400" />,
      title: 'Secure Payments',
      description: 'We hold your payment safely until you move in. If the property doesn\'t match the description, you\'ll get a full refund.'
    },
    {
      icon: <CheckIcon className="w-8 h-8 text-amber-400" />,
      title: 'Quick Support',
      description: 'Our dedicated support team is available to help resolve any issues during your rental experience.'
    },
    {
      icon: <HomeIcon className="w-8 h-8 text-amber-400" />,
      title: 'Quality Guarantee',
      description: 'All properties are verified and meet our luxury standards. Your satisfaction is guaranteed or your money back.'
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
            className="text-center mb-16"
          >
            <h1 
              className="text-4xl md:text-6xl mb-6 text-amber-400 font-semibold"
            >
              Pricing & Protection
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Learn about the benefits of using Swift Luxury for your European luxury rental needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Steps */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How Pricing Works</h2>
            <p className="text-gray-400">What you'll pay depends on your luxury rental journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-amber-400/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-amber-500 text-black rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <span className="text-amber-400 font-semibold">{step.cost}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{step.description}</p>
                
                <div className="space-y-3">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-gray-400 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tenant Protection */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Tenant Protection</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              You're guaranteed a stress-free move-in or your money back
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {protectionFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-black rounded-2xl p-8 border border-gray-800 text-center"
              >
                <div className="bg-amber-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about Swift Luxury pricing</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">What do I need to pay to confirm my booking?</h3>
              <p className="text-gray-300 leading-relaxed">
                You pay the first month's rent plus our one-time Swift Luxury service fee. We safeguard your payment and only transfer it to the landlord 48 hours after you move in, giving you time to ensure everything matches the listing.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">How do I pay my monthly rent?</h3>
              <p className="text-gray-300 leading-relaxed">
                Your landlord can send you payment requests through our secure system. We support multiple payment methods including cryptocurrency (Bitcoin, Ethereum, USDT) and traditional credit cards.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">What is the Tenant Protection fee?</h3>
              <p className="text-gray-300 leading-relaxed">
                Our Tenant Protection fee ensures safe payments, the right to claim a refund, and quick support if there's a last-minute cancellation or move-in delay. This fee covers our premium protection services.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Do you accept cryptocurrency?</h3>
              <p className="text-gray-300 leading-relaxed">
                Yes! Swift Luxury is the first platform to accept cryptocurrency for luxury rental payments. We support Bitcoin, Ethereum, USDT, and traditional credit cards with instant conversion and direct landlord payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-black rounded-3xl p-12 border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Find Your Luxury Home?</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Start browsing our curated collection of luxury properties across Europe's finest cities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl transition-colors">
                Browse Properties
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl transition-colors backdrop-blur-sm">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

