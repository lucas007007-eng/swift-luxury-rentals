'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface HeaderProps {
  forceBackground?: boolean
}

const Header: React.FC<HeaderProps> = ({ forceBackground = false }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Properties', href: '/properties' },
    { name: 'Corporate Rentals', href: '/corporate-rentals' },
    { name: 'List Your Property', href: '/list-your-property' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || forceBackground
          ? 'bg-black/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SL</span>
            </div>
            <span className="font-bold text-xl text-white ml-3">
              Swift Luxury
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-amber-400 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-8">
              <Link
                href="/dashboard"
                className="border border-gray-400/70 text-white font-medium px-6 py-2 rounded-xl transition-colors hover:bg-white/10 hover:border-gray-200"
              >
                My Bookings
              </Link>
            </div>
          </nav>

          {/* Hamburger menu button - mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-amber-400 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-gray-700 shadow-2xl z-[100]">
          <div className="p-4 space-y-3">
            {/* Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-white hover:text-amber-400 font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-700 space-y-3">
              <Link
                href="/login"
                className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
