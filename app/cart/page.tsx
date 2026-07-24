'use client'

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()

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

  return (
    <main className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
                  <p className="text-gray-400 text-sm">Variant: {item.variant}</p>
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

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-400">Total</p>
            <p className="text-3xl font-bold text-white">${(totalPrice / 100).toFixed(2)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm px-4 py-2 border border-red-800 rounded hover:bg-red-900/20 transition">
              Clear Cart
            </button>
            <button className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}