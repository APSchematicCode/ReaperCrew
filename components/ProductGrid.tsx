'use client'

import { useState } from 'react'
import Image from 'next/image'
import QuickViewModal from './QuickViewModal'

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
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  if (!products || products.length === 0) {
    return <div className="text-gray-400">No products available</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const imageCount = product.images_json?.length || 0
          const mainImage = product.images_json?.[0] || ''

          return (
            <div key={product.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition group">
              {/* Image Container */}
              <div className="relative h-64 w-full bg-gray-800">
                {mainImage ? (
                  <>
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {/* A) Image Count Badge */}
                    {imageCount > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-gray-600">
                        +{imageCount - 1}
                      </div>
                    )}
                  </>
                ) : (
                  /* B) Better "No Image" Placeholder */
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">No Image</span>
                  </div>
                )}
                {/* Quick View overlay button */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <span className="bg-white/90 text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition">
                    Quick View
                  </span>
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-white">${(product.price / 100).toFixed(2)}</span>
                  {product.is_pre_order && (
                    <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full uppercase font-semibold">
                      Pre-Order
                    </span>
                  )}
                  {product.product_type === 'service' && (
                    <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full uppercase font-semibold">
                      Custom
                    </span>
                  )}
                </div>
                {product.is_pre_order && product.estimated_ship_date && (
                  <p className="text-xs text-gray-400 mt-2">Ships: {product.estimated_ship_date}</p>
                )}
                <button className="mt-4 w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition font-medium text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </>
  )
}