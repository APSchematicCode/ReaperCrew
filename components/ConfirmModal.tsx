'use client'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'red' | 'blue'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'red',
}: ConfirmModalProps) {
  if (!isOpen) return null

  const confirmColor = confirmVariant === 'red' 
    ? 'bg-red-600 hover:bg-red-700' 
    : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 text-white py-2 rounded transition ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}