'use client'

import { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  description: string
  price: number
  product_type: 'merch' | 'service'
  is_pre_order: boolean
  estimated_ship_date?: string
  images_json: string[]
}

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const images = product.images_json?.length > 0 ? product.images_json : ['/placeholder.svg']
  const mainImage = images[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Close button with custom SVG icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 bg-black/60 rounded-full hover:bg-black/80 transition text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image Carousel */}
          <div className="relative h-80 md:h-125 bg-black overflow-hidden">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((url, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                    <Image
                      src={url}
                      alt={`${product.name} - Image ${idx + 1}`}
                      fill
                      className="object-contain"
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {images.map((_, idx) => (
                  <div key={idx} className="w-2 h-2 rounded-full bg-white/30" />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col">
            <h2 className="text-2xl font-unifraktur text-white mb-1">{product.name}</h2>
            <p className="text-3xl font-bold text-white mb-2">${(product.price / 100).toFixed(2)}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {product.product_type === 'service' && (
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full uppercase font-semibold">
                  Custom
                </span>
              )}
              {product.is_pre_order && (
                <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full uppercase font-semibold">
                  Pre-Order
                </span>
              )}
            </div>

            {product.is_pre_order && product.estimated_ship_date && (
              <p className="text-sm text-gray-400 mb-3">Ships: {product.estimated_ship_date}</p>
            )}

            <p className="text-gray-300 text-sm leading-relaxed mb-6 grow">
              {product.description || 'No description provided.'}
            </p>

            <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
              Add to Cart
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              {images.length} image{images.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}