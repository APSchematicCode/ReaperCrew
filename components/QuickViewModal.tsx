'use client'

import { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

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

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true })
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)

  const variantKeys = product?.variants_json ? Object.keys(product.variants_json) : []

  useEffect(() => {
    if (product && variantKeys.length > 0) {
      setSelectedVariant(variantKeys[0])
    }
    setQuantity(1) // Reset quantity when modal opens
  }, [product])

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

  const handleAddToCart = () => {
    const mainImage = product.images_json?.[0] || ''
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      variant: selectedVariant || 'Default',
      quantity: quantity,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 bg-black/60 rounded-full hover:bg-black/80 transition text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
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
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {images.map((_, idx) => (
                  <div key={idx} className="w-2 h-2 rounded-full bg-white/30" />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col">
            <h2 className="text-2xl font-unifraktur text-white mb-1">{product.name}</h2>
            <p className="text-3xl font-bold text-white mb-2">${(product.price / 100).toFixed(2)}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {product.product_type === 'service' && (
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full uppercase font-semibold">Custom</span>
              )}
              {product.is_pre_order && (
                <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full uppercase font-semibold">Pre-Order</span>
              )}
            </div>

            {/* ✅ Updated Pre-Order Text */}
            {product.is_pre_order && product.estimated_ship_date && (
              <p className="text-sm text-gray-400 mb-3">Will start shipping {product.estimated_ship_date}</p>
            )}

            <p className="text-gray-300 text-sm leading-relaxed mb-4 grow">
              {product.description || 'No description provided.'}
            </p>

            {/* Variant Dropdown */}
            {variantKeys.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Option</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
                >
                  {variantKeys.map((key) => (
                    <option key={key} value={key}>
                      {key} ({product.variants_json[key]} in stock)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ✅ Quantity Selector */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-gray-400 hover:text-white border border-gray-700 rounded w-8 h-8 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-white w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-gray-400 hover:text-white border border-gray-700 rounded w-8 h-8 flex items-center justify-center"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
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