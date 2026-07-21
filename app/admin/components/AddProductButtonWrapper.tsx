'use client'

import { useState } from 'react'
import AddProductModal from './AddProductModal'

export default function AddProductButtonWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProductAdded = () => {
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition"
      >
        + Add New Product
      </button>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </>
  )
}