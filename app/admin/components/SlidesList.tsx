'use client'

import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

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
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (!slides || slides.length === 0) {
    return <div className="text-gray-400 py-4">No slides uploaded yet.</div>
  }

  const handleDelete = async (slideId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return

    setLoadingId(slideId)

    // Extract the file path from the URL
    // URL format: https://.../storage/v1/object/public/slides/slides/filename.jpg
    const urlParts = imageUrl.split('/storage/v1/object/public/slides/')
    const filePath = urlParts.length > 1 ? urlParts[1] : null

    // Delete from storage
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('slides')
        .remove([filePath])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        alert('Failed to delete image from storage. It may still be visible.')
        // Continue to delete from DB anyway to keep it clean
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('slides')
      .delete()
      .eq('id', slideId)

    if (dbError) {
      alert(`Error deleting slide: ${dbError.message}`)
      setLoadingId(null)
      return
    }

    setLoadingId(null)
    window.location.reload()
  }

  const handleMove = async (slideId: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slideId)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === slides.length - 1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentSlide = slides[currentIndex]
    const targetSlide = slides[targetIndex]

    // Swap display_order values
    const currentOrder = currentSlide.display_order
    const targetOrder = targetSlide.display_order

    const { error: updateError } = await supabase
      .from('slides')
      .update({ display_order: targetOrder })
      .eq('id', currentSlide.id)

    if (updateError) {
      alert(`Error reordering: ${updateError.message}`)
      return
    }

    const { error: updateError2 } = await supabase
      .from('slides')
      .update({ display_order: currentOrder })
      .eq('id', targetSlide.id)

    if (updateError2) {
      alert(`Error reordering: ${updateError2.message}`)
      return
    }

    window.location.reload()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {slides.map((slide, index) => (
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
                disabled={index === slides.length - 1 || loadingId === slide.id}
                className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm px-2 py-1 bg-gray-700 rounded"
              >
                ↓
              </button>
            </div>
            <button
              onClick={() => handleDelete(slide.id, slide.image_url)}
              disabled={loadingId === slide.id}
              className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
            >
              {loadingId === slide.id ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}