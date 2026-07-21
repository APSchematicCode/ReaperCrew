'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      alert(`Error deleting product: ${error.message}`)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setShowConfirm(false)
    // Hard reload to ensure the UI matches the database
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-400 hover:text-red-300 text-sm"
        disabled={isLoading}
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">"{productName}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}