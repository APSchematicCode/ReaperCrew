'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'
import ConfirmModal from '@/components/ConfirmModal'

type Inquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
}

interface InboxListProps {
  inquiries: Inquiry[]
}

export default function InboxList({ inquiries }: InboxListProps) {
  const [items, setItems] = useState(inquiries)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Inquiry | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id)
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    setLoadingId(pendingDeleteId)

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', pendingDeleteId)

    if (error) {
      addToast(`Failed to delete message: ${error.message}`, 'error')
      setLoadingId(null)
      setPendingDeleteId(null)
      return
    }

    setItems(items.filter(item => item.id !== pendingDeleteId))
    setLoadingId(null)
    setPendingDeleteId(null)
    addToast('Message deleted.', 'success')
  }

  if (items.length === 0) {
    return <div className="text-gray-400 p-6 text-center">No messages yet.</div>
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Name</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Email</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300 hidden lg:table-cell">Phone</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Message</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-white">{inquiry.name}</td>
                <td className="px-4 py-3 text-gray-300">{inquiry.email}</td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{inquiry.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{inquiry.message}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setSelectedMessage(inquiry)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteClick(inquiry.id)}
                    disabled={loadingId === inquiry.id}
                    className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                  >
                    {loadingId === inquiry.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-800">
        {items.map((inquiry) => (
          <div key={inquiry.id} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-medium">{inquiry.name}</p>
                <p className="text-gray-400 text-sm">{inquiry.email}</p>
              </div>
              <span className="text-gray-500 text-xs whitespace-nowrap">
                {new Date(inquiry.created_at).toLocaleDateString()}
              </span>
            </div>
            {inquiry.phone && (
              <p className="text-gray-400 text-sm">📞 {inquiry.phone}</p>
            )}
            <p className="text-gray-300 text-sm line-clamp-2">{inquiry.message}</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setSelectedMessage(inquiry)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View Full
              </button>
              <button
                onClick={() => handleDeleteClick(inquiry.id)}
                disabled={loadingId === inquiry.id}
                className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
              >
                {loadingId === inquiry.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-unifraktur text-white">Message</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">From</p>
                <p className="text-white font-medium">{selectedMessage.name}</p>
                <p className="text-gray-300 text-sm">{selectedMessage.email}</p>
                {selectedMessage.phone && (
                  <p className="text-gray-400 text-sm">📞 {selectedMessage.phone}</p>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Date</p>
                <p className="text-gray-300 text-sm">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Message</p>
                <p className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedMessage.id
                  setSelectedMessage(null)
                  handleDeleteClick(id)
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setPendingDeleteId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}