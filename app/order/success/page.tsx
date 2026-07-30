'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import Header from '@/components/Header'

// Separate component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  // Clear cart when sessionId is present
  if (sessionId) {
    clearCart()
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full text-center">
      <div className="text-green-500 text-5xl mb-4">✓</div>
      <h1 className="text-3xl font-old-english text-white mb-2">Order Placed!</h1>
      <p className="text-gray-400 mb-2">Thank you for your order. You will receive a confirmation email shortly.</p>
      <p className="text-gray-500 text-sm mb-6">Order ID: {sessionId?.slice(0, 8)}</p>
      <Link href="/shop" className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition inline-block">
        Continue Shopping
      </Link>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {/* ✅ Suspense boundary with a simple loading fallback */}
        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  )
}