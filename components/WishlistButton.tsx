'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'

interface WishlistButtonProps {
  productId: string
  variant: string
  className?: string
}

export default function WishlistButton({ productId, variant, className = '' }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    checkWishlist()
  }, [productId, variant])

  const checkWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('variant', variant)
      .maybeSingle()

    setIsInWishlist(!!data)
    setLoading(false)
  }

  const toggleWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      addToast('Please log in to save favorites.', 'error')
      return
    }

    if (isInWishlist) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variant', variant)

      if (error) {
        addToast('Failed to remove from wishlist.', 'error')
      } else {
        setIsInWishlist(false)
        addToast('Removed from wishlist.', 'success')
      }
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId, variant })

      if (error) {
        addToast('Failed to add to wishlist.', 'error')
      } else {
        setIsInWishlist(true)
        addToast('Added to wishlist!', 'success')
      }
    }
  }

  if (loading) return null

  return (
    <button
      onClick={toggleWishlist}
      className={`transition ${className}`}
      aria-label="Toggle wishlist"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill={isInWishlist ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}