'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { uploadImageToSupabase } from '@/lib/uploadImage'

export default function NewsletterSender() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)
  const [status, setStatus] = useState<{ type: 'idle' | 'sending' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  })
  const { addToast } = useToast()
  const quillRef = useRef<ReactQuill>(null)

  // ✅ Helper to get the Quill editor instance
  const getEditor = () => quillRef.current?.getEditor()

  // ✅ Custom image handler that uses the ref
  const handleImageUpload = async (file: File) => {
    const quill = getEditor()
    if (!quill) {
      addToast('Editor not ready. Please try again.', 'error')
      return
    }

    const range = quill.getSelection()
    if (!range) {
      addToast('Please place your cursor where you want the image.', 'error')
      return
    }

    const url = await uploadImageToSupabase(file, 'newsletter')
    if (url) {
      quill.insertEmbed(range.index, 'image', url)
      quill.setSelection({ index: range.index + 1, length: 0 })
    } else {
      addToast('Failed to upload image. Please try again.', 'error')
    }
  }

  // ✅ Build the modules with a function that captures the ref
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: function (this: any) {
          // Use the file input to trigger upload
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/*')
          input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            if (file) {
              await handleImageUpload(file)
            }
          }
          input.click()
        },
      },
    },
  }

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })

      if (!error) {
        setSubscriberCount(count)
      }
    }
    fetchCount()
  }, [])

  const handleSend = async () => {
    if (!subject.trim()) {
      addToast('Please enter a subject.', 'error')
      return
    }
    if (!content.trim() || content === '<p><br></p>') {
      addToast('Please enter the message content.', 'error')
      return
    }

    setLoading(true)
    setStatus({ type: 'sending', message: 'Sending newsletter...' })

    try {
      const response = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          htmlContent: content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter')
      }

      setStatus({
        type: 'success',
        message: `✅ Sent to ${data.sent} subscribers. Failed: ${data.failed}`,
      })
      addToast(`Newsletter sent to ${data.sent} subscribers!`, 'success')
      setSubject('')
      setContent('')
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      })
      addToast(`Failed to send newsletter: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Send Newsletter</h3>
          <p className="text-gray-400 text-sm">
            {subscriberCount !== null ? `${subscriberCount} subscriber(s)` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your newsletter subject"
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            disabled={loading}
          />
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="bg-black text-white rounded [&_.ql-toolbar]:border-gray-700 [&_.ql-container]:border-gray-700 [&_.ql-editor]:min-h-50 [&_.ql-editor]:text-white"
            readOnly={loading}
          />
          <p className="text-gray-500 text-xs mt-1">
            Use the toolbar to format text, add links, or insert images.
          </p>
        </div>

        {/* Status */}
        {status.type !== 'idle' && (
          <div
            className={`px-4 py-2 rounded text-sm ${
              status.type === 'sending'
                ? 'bg-blue-900/50 text-blue-200'
                : status.type === 'success'
                ? 'bg-green-900/50 text-green-200'
                : 'bg-red-900/50 text-red-200'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || subscriberCount === 0}
          className="w-full bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : `Send to ${subscriberCount !== null ? subscriberCount : '...'} Subscriber(s)`}
        </button>
      </div>
    </div>
  )
}