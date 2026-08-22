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
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between h-16">
          <Link
            href="/"
            style={{ fontFamily: 'OldEnglish, cursive' }}
            className="text-4xl tracking-wider text-white hover:text-gray-300 transition whitespace-nowrap"
          >
            REAPER CREW
          </Link>

          <nav className="flex items-center space-x-6">
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
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between h-16">
          <div className="w-8"></div>

          <Link
            href="/"
            style={{ fontFamily: 'OldEnglish, cursive' }}
            className="text-3xl sm:text-4xl tracking-wider text-white hover:text-gray-300 transition whitespace-nowrap text-center"
          >
            Reaper Crew
          </Link>

          <div className="flex items-center gap-2 relative">
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

        {/* Mobile Drawer (unchanged) */}
        <div
          className={`fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-black/50 backdrop-blur-sm border-l border-gray-700 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto">
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

              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Follow Us</p>
                <div className="flex gap-5">
                  <a href="https://www.instagram.com/sincityreapers2.0?igsi=MWVzMWV1ZHMwcjN2dQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com/@702sincityreapermedia?si=tARbAbi8GJiM9pkm" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition" aria-label="YouTube">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}