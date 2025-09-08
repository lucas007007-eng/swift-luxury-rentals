'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const team = [
    {
      name: 'Alexander Schmidt',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'With over 15 years in Berlin real estate, Alexander founded Swift Luxury to revolutionize the rental experience.'
    },
    {
      name: 'Maria Müller',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c96fce79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Maria ensures seamless operations and exceptional guest experiences across all our properties.'
    },
    {
      name: 'Thomas Weber',
      role: 'Technology Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Thomas leads our tech innovation, developing solutions that make rentals easier for everyone.'
    }
  ]

  const values = [
    {
      title: 'Transparency',
      description: 'We believe in clear communication and honest pricing with no hidden fees.',
      icon: '🔍'
    },
    {
      title: 'Quality',
      description: 'Every property meets our high standards for comfort, cleanliness, and amenities.',
      icon: '⭐'
    },
    {
      title: 'Innovation',
      description: 'We leverage technology to create seamless rental experiences.',
      icon: '💡'
    },
    {
      title: 'Community',
      description: 'We\'re committed to being positive contributors to Berlin\'s neighborhoods.',
      icon: '🤝'
    }
  ]

  return (
    <main className="min-h-screen">
      <Header forceBackground={true} />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About Swift Luxury
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto">
              We're revolutionizing the rental experience in Berlin, making it easier for 
              everyone to find their perfect home, whether it's for a night, a month, or a year.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Berlin's rental market has long been complex and fragmented. We founded 
                Swift Luxury to change that, creating a unified platform that serves 
                every type of rental need with the same level of excellence.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                From short-term stays for visitors to long-term homes for residents, 
                we're committed to making the rental process transparent, efficient, 
                and enjoyable for both guests and property owners.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">500+</div>
                  <div className="text-gray-600">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">10K+</div>
                  <div className="text-gray-600">Happy Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">4.9</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Berlin apartment interior"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from property selection to guest service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate people behind Swift Luxury, working to make your rental experience exceptional.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-gray-50 rounded-2xl p-8"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}





