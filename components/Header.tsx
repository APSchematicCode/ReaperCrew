'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-3xl font-unifraktur tracking-wider text-white hover:text-gray-300 transition">
            Reaper Crew
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/shop" className="text-gray-300 hover:text-white transition">Shop</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
            <Link href="/cart" className="text-gray-300 hover:text-white transition">Cart (0)</Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation (slide-in from right) */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-black border-l border-gray-800 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            } md:hidden`}
        >
          <div className="flex flex-col items-start p-6 space-y-4 mt-16">
            <button onClick={() => setIsMenuOpen(false)} className="self-end text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link href="/shop" className="text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Shop</Link>
            <Link href="/about" className="text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="/contact" className="text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link href="/cart" className="text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Cart (0)</Link>
          </div>
        </div>
      </div>
    </header>
  )
}