'use client'

import { useToast } from '@/context/ToastContext'
import { useEffect } from 'react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex justify-between items-start gap-4 transition-all animate-in slide-in-from-right-5 ${
            toast.type === 'success'
              ? 'bg-green-900/90 border-green-700 text-green-200'
              : toast.type === 'error'
              ? 'bg-red-900/90 border-red-700 text-red-200'
              : 'bg-blue-900/90 border-blue-700 text-blue-200'
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}