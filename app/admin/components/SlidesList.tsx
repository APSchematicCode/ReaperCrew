'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'
import ConfirmModal from '@/components/ConfirmModal'
import Image from 'next/image'

type Slide = {
  id: string
  image_url: string
  link_url: string | null
  display_order: number
}

interface SlidesListProps {
  slides: Slide[]
}

export default function SlidesList({ slides }: SlidesListProps) {
  const [items, setItems] = useState(slides)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; imageUrl: string } | null>(null)
  const { addToast } = useToast()

  const handleDeleteClick = (id: string, imageUrl: string) => {
    setPendingDelete({ id, imageUrl })
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const { id, imageUrl } = pendingDelete
    setLoadingId(id)

    const urlParts = imageUrl.split('/storage/v1/object/public/slides/')
    const filePath = urlParts.length > 1 ? urlParts[1] : null

    if (filePath) {
      await supabase.storage.from('slides').remove([filePath])
    }

    const { error } = await supabase
      .from('slides')
      .delete()
      .eq('id', id)

    if (error) {
      addToast(`Failed to delete slide: ${error.message}`, 'error')
      setLoadingId(null)
      setPendingDelete(null)
      return
    }

    setItems(items.filter(item => item.id !== id))
    setLoadingId(null)
    setPendingDelete(null)
    addToast('Slide deleted.', 'success')
  }

  const handleMove = async (slideId: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(s => s.id === slideId)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === items.length - 1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentSlide = items[currentIndex]
    const targetSlide = items[targetIndex]

    const { error: updateError } = await supabase
      .from('slides')
      .update({ display_order: targetSlide.display_order })
      .eq('id', currentSlide.id)

    if (updateError) {
      addToast(`Failed to reorder: ${updateError.message}`, 'error')
      return
    }

    const { error: updateError2 } = await supabase
      .from('slides')
      .update({ display_order: currentSlide.display_order })
      .eq('id', targetSlide.id)

    if (updateError2) {
      addToast(`Failed to reorder: ${updateError2.message}`, 'error')
      return
    }

    window.location.reload()
  }

  if (!items || items.length === 0) {
    return <div className="text-gray-400 py-4">No slides uploaded yet.</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {items.map((slide, index) => (
          <div key={slide.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden group relative">
            <div className="relative h-48 w-full bg-gray-900">
              <Image
                src={slide.image_url}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
              />
              {slide.link_url && (
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Linked
                </span>
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => handleMove(slide.id, 'up')}
                  disabled={index === 0 || loadingId === slide.id}
                  className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm px-2 py-1 bg-gray-700 rounded"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(slide.id, 'down')}
                  disabled={index === items.length - 1 || loadingId === slide.id}
                  className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm px-2 py-1 bg-gray-700 rounded"
                >
                  ↓
                </button>
              </div>
              <button
                onClick={() => handleDeleteClick(slide.id, slide.image_url)}
                disabled={loadingId === slide.id}
                className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
              >
                {loadingId === slide.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setPendingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Slide"
        message="Are you sure you want to delete this slide? This cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}