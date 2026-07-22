'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
        {/* Drag Handle – touch events work here now */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 select-none touch-none"
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

      {/* 
        ✅ FIX 1: Removed "hidden md:flex" – badges now show on ALL screen sizes 
        Including mobile, just like you wanted.
      */}
      <div className="flex items-center gap-1 md:gap-2 ml-2 flex-shrink-0">
        <div className="flex gap-1 md:gap-2 flex-wrap items-center">
          {product.is_pre_order && (
            <span className="text-[10px] md:text-xs bg-yellow-900 text-yellow-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap">
              Pre-Order
            </span>
          )}
          <span className="text-[10px] md:text-xs bg-gray-700 text-gray-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full capitalize whitespace-nowrap">
            {product.product_type}
          </span>
        </div>
        <div className="flex items-center gap-0.5 md:gap-1">
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

  // ✅ FIX 2: Proper sensors for mobile touch dragging
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold to activate drag (prevents scroll conflicts)
        tolerance: 5, // allow 5px movement before cancelling
      },
    }),
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

    setItems(newItems)
    setIsUpdating(true)

    const updates = newItems.map((item, index) => ({
      id: item.id,
      display_order: index,
    }))

    try {
      const results = await Promise.all(
        updates.map((update) =>
          supabase
            .from('products')
            .update({ display_order: update.display_order })
            .eq('id', update.id)
        )
      )

      const errors = results.filter((result) => result.error)
      if (errors.length > 0) {
        console.error('Some updates failed:', errors)
        alert('Failed to update product order. Please try again.')
      } else {
        console.log('Product order updated successfully!')
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
        Drag the <strong>hamburger icon (⠿)</strong> to reorder products. 
        <span className="block md:inline"> On mobile, <strong>tap and hold</strong> the icon for a moment before dragging.</span>
      </p>
    </div>
  )
}