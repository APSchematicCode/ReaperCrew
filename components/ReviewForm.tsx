'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ReviewFormProps {
  productId: string
  productName: string
  onReviewSubmitted: () => void
}

export default function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [authorName, setAuthorName] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let imageUrl = null

    // 1. Upload image if provided
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `reviews/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(filePath, file)

      if (uploadError) {
        setError('Failed to upload image. Please try again.')
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('reviews')
        .getPublicUrl(filePath)

      imageUrl = publicUrl
    }

    // 2. Insert review
    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        author_name: authorName || 'Anonymous',
        rating: rating,
        text: text,
        image_url: imageUrl,
        is_approved: false, // Pending approval
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    setAuthorName('')
    setRating(5)
    setText('')
    setFile(null)
    onReviewSubmitted()
    setTimeout(() => setSuccess(false), 5000)
  }

  if (success) {
    return (
      <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
        <p className="text-green-200 font-medium">✅ Review submitted!</p>
        <p className="text-green-300 text-sm">It will appear once approved by the shop owner.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-gray-700 pt-4">
      <h4 className="text-white font-medium mb-3">Leave a Review for {productName}</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Your Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
            placeholder="e.g. John D."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl focus:outline-none"
              >
                <span className={star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-600'}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
            placeholder="Tell us about your experience with this product..."
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Upload a Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-400 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50 text-sm"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}