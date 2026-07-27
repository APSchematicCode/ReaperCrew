'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type WaitlistEntry = {
  id: string
  product_id: string
  user_email: string
  variant: string
  created_at: string
  products: { name: string }
}

interface WaitlistListProps {
  entries: WaitlistEntry[]
}

export default function WaitlistList({ entries }: WaitlistListProps) {
  const [items, setItems] = useState(entries)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this email from the waitlist?')) return
    setLoadingId(id)

    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Failed to remove entry.')
      setLoadingId(null)
      return
    }

    setItems(items.filter(item => item.id !== id))
    setLoadingId(null)
  }

  if (items.length === 0) {
    return <div className="text-gray-400 p-6 text-center">No waitlist entries yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Email</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Product</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Variant</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Date</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
              <td className="px-4 py-3 text-white">{entry.user_email}</td>
              <td className="px-4 py-3 text-gray-300">{entry.products?.name || 'Unknown'}</td>
              <td className="px-4 py-3 text-gray-400">{entry.variant || 'Default'}</td>
              <td className="px-4 py-3 text-gray-400 text-sm">
                {new Date(entry.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={loadingId === entry.id}
                  className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                >
                  {loadingId === entry.id ? '...' : 'Remove'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}