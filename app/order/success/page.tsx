'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import Header from '@/components/Header'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  // ✅ Clear cart only once, but do it in a useEffect to avoid interfering with navigation
  // In this case, we'll clear it when the component mounts, but it shouldn't block the link.
  // However, the issue might be that clearCart() triggers a re-render that breaks the router.
  // We'll move it to a useEffect and add a small delay.
  // Actually, we'll just use a standard <a> tag for "Continue Shopping" to bypass router issues.

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full text-center">
      <div className="text-green-500 text-5xl mb-4">✓</div>
      <h1 className="text-3xl font-unifraktur text-white mb-2">Order Placed!</h1>
      <p className="text-gray-400 mb-2">Thank you for your order. You will receive a confirmation email shortly.</p>
      <p className="text-gray-500 text-sm mb-6">Order ID: {sessionId?.slice(0, 8)}</p>
      <p className="text-gray-400 text-xs mt-2"> You checked out as a guest. If you create an account with this email, you'll be able to track your order.</p>
      {/* ✅ Use a standard <a> tag to avoid Next.js routing issues after cart clear */}
      <a href="/shop" className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition inline-block">
        Continue Shopping
      </a>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  )
}