'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-3xl font-unifraktur tracking-wider text-white hover:text-gray-300 transition">
            Reaper Crew
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/shop" className="text-gray-300 hover:text-white transition">Shop</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
            <Link href="/account" className="text-gray-300 hover:text-white transition">Account</Link>
            <Link href="/wishlist" className="text-gray-300 hover:text-white transition" aria-label="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <form action="/shop" method="GET" className="flex items-center">
              <input
                type="text"
                name="search"
                placeholder="Search..."
                className="px-3 py-1.5 bg-black border border-gray-700 rounded-l text-white text-sm focus:outline-none focus:border-gray-500 w-40 lg:w-56"
              />
              <button type="submit" className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-r hover:bg-gray-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            <Link href="/cart" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              Cart
              {totalItems > 0 && (
                <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          <div className="md:hidden flex items-center gap-2 relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
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
            {totalItems > 0 && !isMenuOpen && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Mobile Drawer – FIXED LAYOUT */}
        <div
          className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-black/50 backdrop-blur-sm border-l border-gray-700 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col overflow-hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* 1. Scrollable Content Area (takes all space) */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Search */}
            <div className="p-4 border-b border-gray-700">
              <form action="/shop" method="GET" className="flex items-center">
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  className="flex-1 px-3 py-1.5 bg-black border border-gray-700 rounded-l text-white text-sm focus:outline-none focus:border-gray-500"
                />
                <button type="submit" className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-r hover:bg-gray-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Links */}
            <div className="p-6 space-y-4">
              <Link href="/shop" className="block text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link href="/about" className="block text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link href="/contact" className="block text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <Link href="/account" className="block text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Account</Link>
              <Link href="/wishlist" className="block text-xl text-gray-300 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
              <Link href="/cart" className="block text-xl text-gray-300 hover:text-white transition items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                Cart
                {totalItems > 0 && (
                  <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* 2. Pinned Socials – ALWAYS VISIBLE */}
          <div className="shrink-0 bg-red-600 border-t border-gray-700 p-6">
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">⬇️ FOLLOW US (DEBUG)</p>
            <div className="flex gap-5">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white font-bold hover:underline text-sm">
                INSTAGRAM
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white font-bold hover:underline text-sm">
                YOUTUBE
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}