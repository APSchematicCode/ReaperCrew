'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/context/ToastContext'

export default function ShippingSettings() {
  const [shippingFee, setShippingFee] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetchShippingFee()
  }, [])

  const fetchShippingFee = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'shipping_fee_cents')
      .single()

    if (data) {
      const cents = parseInt(data.value)
      setShippingFee((cents / 100).toFixed(2))
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const cents = Math.round(parseFloat(shippingFee) * 100)
    if (isNaN(cents) || cents < 0) {
      addToast('Please enter a valid shipping fee.', 'error')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('app_settings')
      .update({ value: cents.toString() })
      .eq('key', 'shipping_fee_cents')

    if (error) {
      addToast('Failed to save shipping fee.', 'error')
    } else {
      addToast('Shipping fee updated successfully!', 'success')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Shipping Fee (USD)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
            className="w-32 px-3 py-1.5 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-white text-black px-4 py-1.5 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}