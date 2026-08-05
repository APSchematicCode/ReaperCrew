'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'

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
    if (!content.trim()) {
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
          htmlContent: content.trim(),
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Message (HTML supported)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="<p>Hello subscribers, check out our new gear!</p>"
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500 font-mono text-sm"
            disabled={loading}
          />
          <p className="text-gray-500 text-xs mt-1">
            You can use HTML tags like <code className="bg-gray-700 px-1 rounded">&lt;p&gt;</code>,{' '}
            <code className="bg-gray-700 px-1 rounded">&lt;strong&gt;</code>,{' '}
            <code className="bg-gray-700 px-1 rounded">&lt;a href=&quot;...&quot;&gt;</code>.
          </p>
        </div>

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