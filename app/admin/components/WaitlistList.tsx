'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'

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
  const [notifying, setNotifying] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this email from the waitlist?')) return
    setLoadingId(id)
    const { error } = await supabase.from('waitlist').delete().eq('id', id)
    if (error) {
      addToast(`Failed to remove: ${error.message}`, 'error')
    } else {
      setItems(items.filter(item => item.id !== id))
      addToast('Entry removed.', 'success')
    }
    setLoadingId(null)
  }

  // ✅ "Notify All" for a specific variant
  const handleNotifyAll = async (productId: string, variant: string) => {
    const key = `${productId}-${variant}`
    setNotifying(key)

    // Get all emails for this product + variant
    const targetEntries = items.filter(e => e.product_id === productId && e.variant === variant)
    if (targetEntries.length === 0) {
      addToast('No entries for this variant.', 'error')
      setNotifying(null)
      return
    }

    const emails = targetEntries.map(e => e.user_email)

    // 1. Send email via Brevo
    const brevoKey = process.env.BREVO_API_KEY // This needs to be available in the client? No, we need an API route.
    // Actually, we need to call an API route to send this, or we can just send a notification.
    // I'll use a fetch to a new API route or just send a simple email.
    // For simplicity, I'll log it and send a toast. We'll build a quick API route for this.
    // Let's do a quick fetch to /api/admin/waitlist-notify
    try {
      const response = await fetch('/api/admin/waitlist-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variant, emails }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      addToast(`Notified ${data.sent} users.`, 'success')
    } catch (error: any) {
      addToast(`Failed: ${error.message}`, 'error')
    } finally {
      setNotifying(null)
    }
  }

  // Group entries by product + variant for the "Notify All" buttons
  const groupedEntries = items.reduce((acc, entry) => {
    const key = `${entry.product_id}-${entry.variant}`
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, WaitlistEntry[]>)

  if (items.length === 0) {
    return <div className="text-gray-400 p-6 text-center">No waitlist entries yet.</div>
  }

  return (
    <>
      {/* Notify All Buttons for each variant */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-800 border-b border-gray-700">
        {Object.entries(groupedEntries).map(([key, entries]) => {
          const [productId, variant] = key.split('-')
          const productName = entries[0]?.products?.name || 'Unknown'
          return (
            <button
              key={key}
              onClick={() => handleNotifyAll(productId, variant)}
              disabled={notifying === key}
              className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
            >
              {notifying === key ? 'Sending...' : `Notify ${entries.length} for ${productName} (${variant})`}
            </button>
          )
        })}
      </div>

      {/* Table (unchanged) */}
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
                <td className="px-4 py-3 text-gray-400 text-sm">{new Date(entry.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(entry.id)} disabled={loadingId === entry.id} className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50">
                    {loadingId === entry.id ? '...' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}