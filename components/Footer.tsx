'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'
import Link from 'next/link'

export default function Footer() {
  const { addToast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const subscribed = localStorage.getItem('reapercrew_subscribed') === 'true'
    setIsSubscribed(subscribed)
    setIsLoading(false)
  }, [])

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = form.email.value

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email })

    if (error) {
      if (error.code === '23505') {
        addToast('You are already subscribed!', 'success')
        localStorage.setItem('reapercrew_subscribed', 'true')
        setIsSubscribed(true)
      } else {
        addToast('Failed to subscribe. Please try again.', 'error')
      }
    } else {
      addToast('Subscribed successfully!', 'success')
      localStorage.setItem('reapercrew_subscribed', 'true')
      setIsSubscribed(true)
      form.reset()
    }
  }

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl old-english text-white">REAPER CREW</h2>
            <p className="text-gray-500 text-sm">Tactical Gear & Media Packages.</p>
          </div>

          {/* Links & Socials */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <nav className="flex gap-4 text-sm">
              <Link href="/shop" className="text-gray-400 hover:text-white transition">Shop</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link>
              <Link href="/cart" className="text-gray-400 hover:text-white transition">Cart</Link>
            </nav>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/sincityreapers2.0?igsi=MWVzMWV1ZHMwcjN2dQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@702sincityreapermedia?si=tARbAbi8GJiM9pkm" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="w-full max-w-md mx-auto mt-6">
          <p className="text-gray-400 text-sm mb-2 text-center md:text-left">Join our newsletter</p>
          {isLoading ? (
            <div className="h-10 w-full animate-pulse bg-gray-800 rounded" />
          ) : isSubscribed ? (
            <div className="text-green-400 text-sm text-center md:text-left">
              ✅ You're already subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              />
              <button type="submit" className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition">
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mt-6 border-t border-gray-800 pt-4">
          <Link href="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-300 transition">Terms of Service</Link>
          <Link href="/returns" className="hover:text-gray-300 transition">Returns Policy</Link>
        </div>

        <div className="text-center text-gray-600 text-xs mt-4">
          &copy; 2024 Reaper Crew. All rights reserved.
        </div>
      </div>
    </footer>
  )
}