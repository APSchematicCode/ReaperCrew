'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import WaitlistButton from './WaitlistButton'

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
}

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [containerHeight, setContainerHeight] = useState<number>(400)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const variantKeys = product?.variants_json ? Object.keys(product.variants_json) : []
  const isService = product?.product_type === 'service'
  const images = product?.images_json || []
  const isGloballyOutOfStock = product?.out_of_stock === true
  const allVariantsOOS = variantKeys.every(key => (product?.variants_json?.[key] || 0) <= 0)
  const selectedVariantStock = selectedVariant ? (product?.variants_json?.[selectedVariant] || 0) : 0
  const isSelectedVariantOOS = selectedVariantStock <= 0

  // Auto-select first variant on load
  useEffect(() => {
    if (variantKeys.length > 0 && !selectedVariant) {
      setSelectedVariant(variantKeys[0])
    }
  }, [variantKeys, selectedVariant])

  const updateHeight = useCallback(() => {
    if (!emblaApi || !containerRef.current || !product) return
    const index = emblaApi.selectedScrollSnap()
    const imageUrl = images[index]
    const metadata = product.image_metadata?.[imageUrl]

    if (metadata && metadata.width && metadata.height) {
      const containerWidth = containerRef.current.clientWidth
      const aspectRatio = metadata.width / metadata.height
      const calculatedHeight = containerWidth / aspectRatio
      setContainerHeight(calculatedHeight)
    } else {
      setContainerHeight(400)
    }
  }, [emblaApi, images, product])

  useEffect(() => {
    if (product && variantKeys.length > 0) {
      setSelectedVariant(variantKeys[0])
    }
    setQuantity(1)
  }, [product])

  useEffect(() => {
    if (!emblaApi || !product) return
    setTimeout(() => {
      updateHeight()
      setIsReady(true)
    }, 100)
    emblaApi.on('select', updateHeight)
    window.addEventListener('resize', updateHeight)
    return () => {
      emblaApi.off('select', updateHeight)
      window.removeEventListener('resize', updateHeight)
    }
  }, [emblaApi, updateHeight, product])

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

  const handleAddToCart = () => {
    const mainImage = product.images_json?.[0] || ''
    let finalPrice = product.price
    const variantExtra = product.variants_json?.[selectedVariant] || 0
    if (isService && variantExtra > 0) {
      finalPrice = product.price + variantExtra
    }
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
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
          <div
            ref={containerRef}
            className="relative bg-black overflow-hidden transition-[height] duration-500 ease-in-out"
            style={{ height: isReady ? containerHeight : 'auto' }}
          >
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
              {(isGloballyOutOfStock || allVariantsOOS) ? (
                <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full uppercase font-semibold">Out of Stock</span>
              ) : isService ? (
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full uppercase font-semibold">Custom</span>
              ) : null}
              {product.is_pre_order && !isGloballyOutOfStock && !allVariantsOOS && (
                <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full uppercase font-semibold">Pre-Order</span>
              )}
            </div>

            {product.is_pre_order && product.estimated_ship_date && !isGloballyOutOfStock && !allVariantsOOS && (
              <p className="text-sm text-gray-400 mb-3">Will start shipping {product.estimated_ship_date}</p>
            )}

            <p className="text-gray-300 text-sm leading-relaxed mb-4 grow">
              {product.description || 'No description provided.'}
            </p>

            {/* ✅ DROPDOWN: All variants selectable */}
            {variantKeys.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {isService ? 'Select Package' : 'Select Size'}
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className={`w-full px-3 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500 ${
                    isGloballyOutOfStock ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  disabled={isGloballyOutOfStock}
                >
                  {variantKeys.map((key) => {
                    const stock = product.variants_json[key] || 0
                    const isOOS = stock <= 0
                    return (
                      <option key={key} value={key} className={isOOS ? 'text-red-400' : 'text-white'}>
                        {key} {isService ? `(+$${(stock / 100).toFixed(2)})` : isOOS ? '(Out of Stock)' : `(${stock} in stock)`}
                      </option>
                    )
                  })}
                </select>
              </div>
            )}

            {/* ✅ RENDER LOGIC: Show Waitlist for OOS variant, Add to Cart for In Stock */}
            {(isGloballyOutOfStock || allVariantsOOS) ? (
              <div className="mt-2">
                <WaitlistButton
                  productId={product.id}
                  productName={product.name}
                  variant={selectedVariant || 'Default'}
                />
              </div>
            ) : isSelectedVariantOOS ? (
              <>
                <div className="mb-3">
                  <span className="block text-center text-red-500 font-bold text-sm uppercase tracking-wider border border-red-800 bg-red-900/20 py-2 rounded">
                    Out of Stock
                  </span>
                </div>
                <WaitlistButton
                  productId={product.id}
                  productName={product.name}
                  variant={selectedVariant || 'Default'}
                />
              </>
            ) : (
              <>
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
              </>
            )}

            <p className="text-xs text-gray-500 text-center mt-3">
              {images.length} image{images.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}