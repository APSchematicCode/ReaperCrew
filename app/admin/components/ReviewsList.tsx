'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'
import ConfirmModal from '@/components/ConfirmModal'
import Image from 'next/image'

type Review = {
  id: string
  product_id: string
  author_name: string
  rating: number
  text: string
  image_url: string | null
  is_approved: boolean
  created_at: string
  products: { name: string }
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const { addToast } = useToast()

  const fetchReviews = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', id)
    if (error) {
      addToast(`Failed to approve: ${error.message}`, 'error')
    } else {
      addToast('Review approved.', 'success')
      fetchReviews()
    }
  }

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: false })
      .eq('id', id)
    if (error) {
      addToast(`Failed to revoke: ${error.message}`, 'error')
    } else {
      addToast('Review revoked.', 'success')
      fetchReviews()
    }
  }

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id)
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', pendingDeleteId)
    if (error) {
      addToast(`Failed to delete: ${error.message}`, 'error')
      setPendingDeleteId(null)
    } else {
      addToast('Review deleted.', 'success')
      setPendingDeleteId(null)
      fetchReviews()
    }
  }

  const pendingReviews = reviews.filter(r => !r.is_approved)
  const approvedReviews = reviews.filter(r => r.is_approved)
  const filteredReviews = activeTab === 'pending' ? pendingReviews : approvedReviews

  if (loading) return <div className="text-gray-400 p-6">Loading reviews...</div>

  return (
    <>
      <div className="flex gap-4 mb-4 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-t transition ${
            activeTab === 'pending' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pendingReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 text-sm font-medium rounded-t transition ${
            activeTab === 'approved' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Approved ({approvedReviews.length})
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-gray-400 p-6 text-center">No {activeTab} reviews.</div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-medium">{review.author_name}</span>
                    <span className="text-yellow-400 text-sm">
                      {'★'.repeat(review.rating)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">Product: <span className="text-white">{review.products?.name || 'Unknown'}</span></p>
                  <p className="text-gray-300 mt-1">{review.text}</p>
                  {review.image_url && (
                    <div className="mt-2 relative w-20 h-20 bg-gray-700 rounded overflow-hidden">
                      <Image src={review.image_url} alt="Review" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {activeTab === 'pending' ? (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRevoke(review.id)}
                      className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(review.id)}
                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setPendingDeleteId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}