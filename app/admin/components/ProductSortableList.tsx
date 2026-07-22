'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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
import EditProductButton from './EditProductButton'
import DeleteProductButton from './DeleteProductButton'

type Product = {
  id: string
  name: string
  description: string
  price: number
  product_type: 'merch' | 'service'
  is_pre_order: boolean
  estimated_ship_date?: string
  images_json?: string[]
  display_order: number
}

interface SortableProductItemProps {
  product: Product
}

function SortableProductItem({ product }: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-500 transition"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag Handle – this is where listeners go */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 select-none"
          title="Drag to reorder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm md:text-base truncate">{product.name}</p>
          <p className="text-gray-400 text-xs">${(product.price / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-4 shrink-0">
        <div className="hidden md:flex gap-2">
          {product.is_pre_order && (
            <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full">Pre-Order</span>
          )}
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">
            {product.product_type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <EditProductButton product={product} />
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  )
}

interface ProductSortableListProps {
  products: Product[]
}

export default function ProductSortableList({ products }: ProductSortableListProps) {
  const [items, setItems] = useState(products)
  const [isUpdating, setIsUpdating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)

    // Update UI immediately
    setItems(newItems)
    setIsUpdating(true)

    // Build updates
    const updates = newItems.map((item, index) => ({
      id: item.id,
      display_order: index,
    }))

    try {
      // Send all updates in parallel for speed
      const results = await Promise.all(
        updates.map((update) =>
          supabase
            .from('products')
            .update({ display_order: update.display_order })
            .eq('id', update.id)
        )
      )

      // Check for errors
      const errors = results.filter((result) => result.error)
      if (errors.length > 0) {
        console.error('Some updates failed:', errors)
        alert('Failed to update product order. Please try again.')
      } else {
        console.log('Product order updated successfully!')
        // Reload the admin page to refresh the list order
        window.location.reload()
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('An error occurred while updating order.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div>
      {isUpdating && (
        <div className="text-blue-400 text-sm mb-2">Updating order...</div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((product) => (
              <SortableProductItem key={product.id} product={product} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-gray-500 text-xs mt-3">
        Drag the <strong>hamburger icon (⠿)</strong> to reorder products. First item appears first on the storefront.
      </p>
    </div>
  )
}