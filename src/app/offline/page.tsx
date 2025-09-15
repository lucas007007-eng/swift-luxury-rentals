'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      
      <section className="pt-32 md:pt-36 lg:pt-40 pb-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-amber-500/10 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              You're Offline
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              No internet connection detected. Don't worry - you can still browse cached properties and pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cached Properties</h3>
              <p className="text-gray-400 text-sm">Browse previously viewed luxury properties</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Saved Favorites</h3>
              <p className="text-gray-400 text-sm">Access your favorite properties offline</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Contact Forms</h3>
              <p className="text-gray-400 text-sm">Forms will sync when connection returns</p>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">Available Offline</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <a href="/" className="text-amber-400 hover:text-amber-300 transition-colors">
                🏠 Homepage
              </a>
              <a href="/properties" className="text-amber-400 hover:text-amber-300 transition-colors">
                🏢 Properties
              </a>
              <a href="/about" className="text-amber-400 hover:text-amber-300 transition-colors">
                ℹ️ About
              </a>
              <a href="/contact" className="text-amber-400 hover:text-amber-300 transition-colors">
                📞 Contact
              </a>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
