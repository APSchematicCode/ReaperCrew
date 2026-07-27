'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase
      .from('inquiries')
      .insert({ name, email, phone, message })

    if (insertError) {
      setError('Failed to send message. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-unifraktur text-white mb-4">Contact</h1>
        <p className="text-gray-400 text-lg mb-8">
          Have questions about our gear or want to book a media package? Reach out below.
          <br className="hidden sm:block" />
          <span className="text-gray-500 text-sm">
            For order inquiries and customer support, please provide your order number if applicable.
          </span>
        </p>

        {submitted ? (
          <div className="bg-green-900/30 border border-green-700 text-green-200 px-6 py-4 rounded-lg">
            <h3 className="text-xl font-semibold">Message sent!</h3>
            <p className="text-green-300">We'll get back to you as soon as possible.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm text-green-400 hover:text-green-300 underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition resize-y"
                placeholder="Tell us what you need..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            <p className="text-gray-500 text-xs text-center">
              By submitting this form, you agree to our privacy policy.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}