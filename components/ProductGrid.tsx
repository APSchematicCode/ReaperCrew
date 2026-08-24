'use client'

import { useState } from 'react'
import Image from 'next/image'
import QuickViewModal from './QuickViewModal'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import WaitlistButton from './WaitlistButton'
import WishlistButton from './WishlistButton'
import SizeGuideModal from './SizeGuideModal'

type Product = {
  id: string
  name: string
  description: string
  price: number
  product_type: 'merch' | 'service'
  is_pre_order: boolean
  estimated_ship_date?: string
  images_json: string[]
  variants_json: any
  image_metadata?: Record<string, { width: number; height: number }>
  out_of_stock?: boolean
  specifications?: Record<string, string>
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addItem } = useCart()
  const { addToast } = useToast()

  if (!products || products.length === 0) {
    return <div className="text-gray-400">No products available</div>
  }

  const handleAddToCart = (product: Product, quantity: number) => {
    const variantKeys = product.variants_json ? Object.keys(product.variants_json) : []
    const defaultVariant = variantKeys[0] || 'Default'
    const mainImage = product.images_json?.[0] || ''
    let finalPrice = product.price
    const isService = product.product_type === 'service'
    const variantExtra = product.variants_json?.[defaultVariant] || 0
    if (isService && variantExtra > 0) {
      finalPrice = product.price + variantExtra
    }
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: mainImage,
      variant: defaultVariant,
      quantity: quantity,
    })
    addToast(`${product.name} added to cart!`, 'success')
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const imageCount = product.images_json?.length || 0
          const mainImage = product.images_json?.[0] || ''
          const isGloballyOutOfStock = product.out_of_stock === true
          const variantKeys = product.variants_json ? Object.keys(product.variants_json) : []
          const allVariantsOOS = variantKeys.every(key => (product.variants_json?.[key] || 0) <= 0)
          const isService = product.product_type === 'service'
          const isOOS = isGloballyOutOfStock || allVariantsOOS

          return (
            <div
              key={product.id}
              className="group relative bg-transparent overflow-hidden transition duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-square w-full bg-gray-900 overflow-hidden rounded-xl">
                {mainImage ? (
                  <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">No Image</span>
                  </div>
                )}
                {imageCount > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm border border-gray-600">
                    +{imageCount - 1}
                  </span>
                )}

                {/* Quick View Overlay (Always visible on mobile, hover on desktop) */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                >
                  <span className="bg-white/90 text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition">
                    Quick View
                  </span>
                </button>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-1">
                <h3 className="text-base font-medium text-white group-hover:text-gray-300 transition">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-white">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                  {isOOS ? (
                    <span className="text-xs bg-red-900/70 text-red-300 px-2 py-0.5 rounded-full uppercase font-medium">
                      OOS
                    </span>
                  ) : product.is_pre_order ? (
                    <span className="text-xs bg-yellow-900/70 text-yellow-300 px-2 py-0.5 rounded-full uppercase font-medium">
                      Pre-Order
                    </span>
                  ) : isService ? (
                    <span className="text-xs bg-blue-900/70 text-blue-300 px-2 py-0.5 rounded-full uppercase font-medium">
                      Custom
                    </span>
                  ) : null}
                </div>
                {product.is_pre_order && product.estimated_ship_date && !isOOS && (
                  <p className="text-xs text-gray-400">Ships: {product.estimated_ship_date}</p>
                )}

                {/* Action Row: Wishlist + Add to Cart / Waitlist */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800/50">
                  <WishlistButton
                    productId={product.id}
                    variant="Default"
                    className="text-gray-400 hover:text-white transition p-1"
                  />
                  {isOOS ? (
                    <WaitlistButton
                      productId={product.id}
                      variant="Default"
                      className="text-xs text-gray-400 hover:text-white transition flex-1 text-center py-1 border border-gray-700 rounded hover:border-gray-500"
                    />
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product, 1)}
                      className="w-full text-sm font-medium bg-white text-black py-1.5 rounded hover:bg-gray-200 transition flex items-center justify-center gap-1"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <QuickViewModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </>
  )
}