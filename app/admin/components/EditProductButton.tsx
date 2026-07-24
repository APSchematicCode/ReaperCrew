'use client'

import { useState } from 'react'
import EditProductModal from './EditProductModal'

interface EditProductButtonProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    product_type: 'merch' | 'service'
    is_pre_order: boolean
    estimated_ship_date?: string
    images_json?: string[] // <-- ADD THIS (optional)
  }
}

export default function EditProductButton({ product }: EditProductButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-blue-400 hover:text-blue-300 text-sm mr-3"
      >
        Edit
      </button>
      <EditProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  )
}