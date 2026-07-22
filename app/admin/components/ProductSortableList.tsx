'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      {...listeners}
      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-500 transition cursor-grab active:cursor-grabbing"
    >
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm md:text-base truncate">{product.name}</p>
        <p className="text-gray-400 text-xs">${(product.price / 100).toFixed(2)}</p>
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
  const router = useRouter()
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

    // Update local state immediately for smooth UI
    setItems(newItems)
    setIsUpdating(true)

    // Prepare updates: assign new display_order based on index
    const updates = newItems.map((item, index) => ({
      id: item.id,
      display_order: index,
    }))

    // Send updates to Supabase in bulk
    try {
      for (const update of updates) {
        await supabase
          .from('products')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    } finally {
      setIsUpdating(false)
      // Refresh the server component to get fresh data
      window.location.reload()
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
      <p className="text-gray-500 text-xs mt-3">Drag items to reorder. First item appears first on the storefront.</p>
    </div>
  )
}