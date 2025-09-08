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
    { name: 'About Berlin Luxe', href: '/about' },
    { name: 'Berlin Stays', href: '/stays' },
    { name: 'Berlin Realty', href: '/realty' },
    { name: 'For Customers', href: '/customers' },
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

          {/* Hamburger menu button - visible on all screens */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:text-primary-300 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Hamburger Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-primary-600 font-medium py-2 text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-4 py-2">
                  <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <HeartIcon className="w-6 h-6" />
                  </button>
                  <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <UserIcon className="w-6 h-6" />
                  </button>
                </div>
                <Link
                  href="/login"
                  className="block text-gray-700 hover:text-primary-600 font-medium py-2 text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/list"
                  className="block btn-primary text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  List with Us
                </Link>
              </div>
            </div>
          </div>
        )}
    </header>
  )
}

export default Header
