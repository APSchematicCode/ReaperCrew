'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface WaitlistButtonProps {
  productId: string
  productName: string
  variant: string
}

export default function WaitlistButton({ productId, productName, variant }: WaitlistButtonProps) {
  const [email, setEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({
        product_id: productId,
        user_email: email,
        variant: variant,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('You are already on the waitlist for this variant.')
      } else {
        setError('Failed to join waitlist. Please try again.')
      }
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    setEmail('')
    setTimeout(() => {
      setIsOpen(false)
      setSuccess(false)
    }, 3000)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 text-sm text-gray-400 hover:text-white transition border border-gray-700 py-1.5 rounded hover:border-gray-500"
      >
        Notify me when back in stock
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-unifraktur text-white mb-2">Get Notified</h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter your email and we'll let you know when <span className="text-white">{productName}</span> ({variant}) is back in stock.
            </p>

            {success ? (
              <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">
                ✅ You're on the list! We'll notify you when it's back.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Notify Me'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}