'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    description: string
    price: number
    product_type: 'merch' | 'service'
    is_pre_order: boolean
    estimated_ship_date?: string
    images_json?: string[]
  } | null
}

// Sortable Item Component
interface SortableItemProps {
  id: string
  url: string
  isNew: boolean
  onRemove: (id: string) => void
}

function SortableItem({ id, url, isNew, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-16 h-16 bg-gray-800 rounded border border-gray-700 group cursor-grab active:cursor-grabbing"
    >
      <Image src={url} alt="Product image" fill className="object-cover rounded" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(id)
          }}
          className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
        >
          ×
        </button>
      </div>
      {isNew && (
        <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] text-center uppercase font-bold py-0.5">
          New
        </span>
      )}
    </div>
  )
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [productType, setProductType] = useState('merch')
  const [isPreOrder, setIsPreOrder] = useState(false)
  const [estimatedShipDate, setEstimatedShipDate] = useState('')
  const [imageItems, setImageItems] = useState<{ id: string; url: string; isNew: boolean; file?: File }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setDescription(product.description || '')
      setPrice((product.price / 100).toFixed(2))
      setProductType(product.product_type || 'merch')
      setIsPreOrder(product.is_pre_order || false)
      setEstimatedShipDate(product.estimated_ship_date || '')
      // Initialize image items from existing images
      const existing = (product.images_json || []).map((url, index) => ({
        id: `existing-${index}-${Date.now()}`,
        url,
        isNew: false,
      }))
      setImageItems(existing)
    }
  }, [product])

  if (!isOpen || !product) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url: URL.createObjectURL(file),
        isNew: true,
        file,
      }))
      setImageItems((prev) => [...prev, ...newFiles])
      // Reset the input so the same file can be re-selected if needed
      e.target.value = ''
    }
  }

  const handleRemoveImage = (id: string) => {
    setImageItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const uploadNewImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const priceInCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Please enter a valid price.')
      setLoading(false)
      return
    }

    try {
      // Separate existing URLs and new files
      const existingUrls = imageItems.filter(item => !item.isNew).map(item => item.url)
      const newFiles = imageItems.filter(item => item.isNew && item.file).map(item => item.file!)

      let uploadedUrls: string[] = []
      if (newFiles.length > 0) {
        uploadedUrls = await uploadNewImages(newFiles)
      }

      // Final ordered list: existing URLs (in order) + newly uploaded URLs (in order)
      const finalImageUrls = [...existingUrls, ...uploadedUrls]

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          description,
          price: priceInCents,
          product_type: productType,
          is_pre_order: isPreOrder,
          estimated_ship_date: isPreOrder ? estimatedShipDate : null,
          images_json: finalImageUrls,
        })
        .eq('id', product.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setLoading(false)
      onClose()
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-unifraktur text-white mb-4">Edit Product</h2>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Type</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              <option value="merch">Merch (Physical)</option>
              <option value="service">Service (Media Package)</option>
            </select>
          </div>

          {/* Sortable Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Images <span className="text-gray-500 text-xs font-normal">(Drag to reorder. First is main photo)</span>
            </label>
            {imageItems.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={imageItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-2 p-2 bg-black/30 rounded border border-gray-700 min-h-18">
                    {imageItems.map((item) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        url={item.url}
                        isNew={item.isNew}
                        onRemove={handleRemoveImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-gray-500 text-sm p-2 bg-black/30 rounded border border-gray-700 text-center">
                No images yet. Upload some below.
              </div>
            )}
            <p className="text-gray-500 text-xs mt-1">Drag to reorder. Click × to remove.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Add New Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPreOrder"
              checked={isPreOrder}
              onChange={(e) => setIsPreOrder(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isPreOrder" className="text-sm text-gray-300">This is a Pre-Order item</label>
          </div>

          {isPreOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Ship Date</label>
              <input
                type="text"
                value={estimatedShipDate}
                onChange={(e) => setEstimatedShipDate(e.target.value)}
                placeholder="e.g. Ships in 4-6 weeks"
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}