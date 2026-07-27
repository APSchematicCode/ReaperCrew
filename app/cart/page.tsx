'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

const SHIPPING_FEE_DOLLARS = 14.99
const SHIPPING_TIME = "2-3 business days"
const SHIPPING_FEE_CENTS = Math.round(SHIPPING_FEE_DOLLARS * 100)

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-unifraktur text-white mb-4">Your Cart</h1>
        <p className="text-gray-400 mb-6">Your cart is empty.</p>
        <Link href="/shop" className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition">
          Start Shopping
        </Link>
      </main>
    )
  }

  const applyCoupon = async () => {
    setCouponError('')
    setIsApplying(true)

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .single()

    if (error || !data) {
      setCouponError('Invalid coupon code.')
      setIsApplying(false)
      return
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('This coupon has expired.')
      setIsApplying(false)
      return
    }

    // Check usage limit
    if (data.usage_limit > 0 && data.used_count >= data.usage_limit) {
      setCouponError('This coupon has reached its usage limit.')
      setIsApplying(false)
      return
    }

    let discount = 0
    if (data.type === 'percentage') {
      discount = totalPrice * (data.value / 100)
    } else {
      discount = data.value // already in cents
    }

    // Cap discount to not exceed subtotal
    if (discount > totalPrice) discount = totalPrice

    setAppliedCoupon({
      code: data.code,
      discount: discount,
      type: data.type,
    })
    setIsApplying(false)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const subtotal = totalPrice
  const shipping = SHIPPING_FEE_CENTS
  const discount = appliedCoupon?.discount || 0
  const total = subtotal + shipping - discount

  return (
    <main className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/shop" className="text-gray-400 hover:text-white transition inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-unifraktur text-white mb-8">Shopping Cart</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-800">
            {items.map((item) => (
              <li key={`${item.id}-${item.variant}`} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 bg-gray-800 rounded overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-contain" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold">{item.name}</h3>
                  <p className="text-gray-400 text-sm">Package: <span className="text-gray-300">{item.variant}</span></p>
                  <p className="text-white font-bold">${(item.price / 100).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                    className="text-gray-400 hover:text-white border border-gray-700 rounded w-8 h-8 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-white w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                    className="text-gray-400 hover:text-white border border-gray-700 rounded w-8 h-8 flex items-center justify-center"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id, item.variant)}
                    className="text-red-400 hover:text-red-300 text-sm ml-2"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Coupon Section */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          {appliedCoupon ? (
            <div className="flex justify-between items-center">
              <div>
                <span className="text-green-400 font-medium">✅ Coupon applied: {appliedCoupon.code}</span>
                <span className="text-gray-400 text-sm ml-3">(-${(appliedCoupon.discount / 100).toFixed(2)})</span>
              </div>
              <button onClick={removeCoupon} className="text-red-400 hover:text-red-300 text-sm">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={applyCoupon}
                disabled={isApplying || !couponCode}
                className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
              {couponError && <p className="text-red-400 text-sm">{couponError}</p>}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping (Flat Rate)</span>
              <span className="text-white">${(shipping / 100).toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-${(appliedCoupon.discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Estimated Delivery:</span>
              <span>{SHIPPING_TIME}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-800 pt-2">
              <span className="text-white">Total</span>
              <span className="text-white">${(total / 100).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm px-4 py-2 border border-red-800 rounded hover:bg-red-900/20 transition flex-1 sm:flex-none">
              Clear Cart
            </button>
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser()
                const { error } = await supabase.from('orders').insert({
                  user_id: user?.id || null,
                  customer_email: user?.email || 'guest@example.com',
                  customer_name: user?.user_metadata?.name || 'Guest',
                  items_json: items.map(item => ({
                    name: item.name,
                    variant: item.variant,
                    price: item.price,
                    quantity: item.quantity
                  })),
                  total_cents: total,
                  original_total_cents: subtotal + shipping,
                  discount_cents: discount,
                  coupon_code: appliedCoupon?.code || null,
                  status: 'pending'
                })
                if (error) {
                  alert('Failed to place order: ' + error.message)
                } else {
                  alert('Order placed! Check the admin dashboard.')
                  clearCart()
                }
              }}
              className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition flex-1 sm:flex-none"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}