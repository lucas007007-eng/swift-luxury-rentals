'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <PhoneIcon className="w-8 h-8" />,
      title: 'Phone',
      details: ['+49 (30) 1234-5678', '+49 (30) 9876-5432 (Emergency)'],
      description: 'Call us during business hours or our 24/7 emergency line'
    },
    {
      icon: <EnvelopeIcon className="w-8 h-8" />,
      title: 'Email',
      details: ['info@swiftluxury.de', 'support@swiftluxury.de'],
      description: 'Send us an email and we\'ll respond within 24 hours'
    },
    {
      icon: <MapPinIcon className="w-8 h-8" />,
      title: 'Office',
      details: ['Unter den Linden 77', '10117 Berlin, Germany'],
      description: 'Visit our office in the heart of Berlin'
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: 'Hours',
      details: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'],
      description: 'Our regular business hours (CET)'
    }
  ]

  const faqs = [
    {
      question: 'How do I book a property?',
      answer: 'You can book directly through our website by selecting your dates and completing the booking form. We\'ll confirm your reservation within 2 hours.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Our cancellation policy varies by property type. Short-term rentals offer flexible cancellation up to 24 hours before check-in. Long-term rentals require 30 days notice.'
    },
    {
      question: 'Do you provide cleaning services?',
      answer: 'Yes, all our properties include professional cleaning before your arrival. We also offer additional cleaning services during extended stays.'
    },
    {
      question: 'Are pets allowed?',
      answer: 'Many of our properties are pet-friendly. Look for the "Pet Friendly" badge on property listings or contact us to find suitable accommodations for your furry friends.'
    },
    {
      question: 'How do I access the property?',
      answer: 'We provide detailed check-in instructions 24 hours before your arrival, including key codes or key collection details. Our team is available to assist with check-in if needed.'
    }
  ]

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl mb-6 text-amber-400 font-semibold">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              We're here to help with all your rental needs in Berlin. Whether you have questions 
              about a property or need assistance with your booking, our team is ready to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-gray-900 rounded-2xl p-8 border border-gray-800"
              >
                <div className="text-amber-400 mb-4 flex justify-center">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{info.title}</h3>
                <div className="space-y-2 mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-300 font-medium">{detail}</p>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactForm />

      {/* FAQ Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">
              Find quick answers to common questions about our rental services.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800"
              >
                <h3 className="text-xl font-bold text-white mb-4">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              Still have questions? We're here to help!
            </p>
            <a
              href="mailto:info@swiftluxury.de"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Contact Our Support Team
            </a>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">Visit Our Office</h2>
            <p className="text-xl text-gray-300">
              Located in the heart of Berlin, we're easy to reach by public transport.
            </p>
          </div>
          
          <div className="bg-black rounded-2xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <h3 className="text-2xl font-bold text-white mb-6">Office Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <MapPinIcon className="w-6 h-6 text-amber-400 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Address</p>
                      <p className="text-gray-300">Unter den Linden 77<br />10117 Berlin, Germany</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <ClockIcon className="w-6 h-6 text-amber-400 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Office Hours</p>
                      <p className="text-gray-300">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-amber-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">Public Transport</p>
                      <p className="text-gray-300">
                        U-Bahn: Friedrichstraße (U6)<br />
                        S-Bahn: Friedrichstraße (S1, S2, S25)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-96 lg:h-auto bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPinIcon className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-sm">Map integration would be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}





