'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  expires_at: string | null
  usage_limit: number
  used_count: number
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Coupon | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCoupons(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await supabase.from('coupons').delete().eq('id', id)
    fetchCoupons()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const code = (formData.get('code') as string).toUpperCase()
    const type = formData.get('type') as string
    const value = parseInt(formData.get('value') as string)
    const expires_at = formData.get('expires_at') as string || null
    const usage_limit = parseInt(formData.get('usage_limit') as string) || 0

    if (editing) {
      await supabase
        .from('coupons')
        .update({ code, type, value, expires_at, usage_limit })
        .eq('id', editing.id)
    } else {
      await supabase
        .from('coupons')
        .insert({ code, type, value, expires_at, usage_limit, used_count: 0 })
    }
    setEditing(null)
    fetchCoupons()
    form.reset()
  }

  if (loading) return <div className="text-gray-400">Loading coupons...</div>

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg border border-gray-700 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        {/* Code */}
        <div className="md:col-span-1">
          <label className="text-xs text-gray-400">Code *</label>
          <input
            name="code"
            defaultValue={editing?.code || ''}
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
            required
            className="w-full px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
          />
        </div>
        {/* Type */}
        <div className="md:col-span-1">
          <label className="text-xs text-gray-400">Type</label>
          <select
            name="type"
            defaultValue={editing?.type || 'percentage'}
            className="w-full px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed ($)</option>
          </select>
        </div>
        {/* Value */}
        <div className="md:col-span-1">
          <label className="text-xs text-gray-400">Value *</label>
          <input
            name="value"
            type="number"
            step={editing?.type === 'percentage' ? '1' : '0.01'}
            defaultValue={editing?.value || ''}
            required
            className="w-full px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
          />
        </div>
        {/* Expires At – Shortened width, visible icon */}
        <div className="md:col-span-1">
          <label className="text-xs text-gray-400">Expires (Optional)</label>
          <input
            name="expires_at"
            type="datetime-local"
            defaultValue={editing?.expires_at?.slice(0, 16) || ''}
            style={{ colorScheme: 'dark' }}
            className="w-full max-w-250px px-6 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100"
          />
        </div>
        {/* Limit */}
        <div className="md:col-span-1">
          <label className="text-xs text-gray-400">Limit</label>
          <input
            name="usage_limit"
            type="number"
            defaultValue={editing?.usage_limit || 0}
            className="w-full px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
          />
        </div>
        {/* Buttons - Full Width */}
        <div className="md:col-span-6 flex gap-3">
          <button type="submit" className="bg-white text-black px-4 py-1.5 rounded font-medium hover:bg-gray-200 transition">
            {editing ? 'Update' : 'Create'}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-white text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      {coupons.length === 0 ? (
        <div className="text-gray-400 text-center p-6">No coupons created yet.</div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-4 py-2 text-sm text-gray-300">Code</th>
                <th className="px-4 py-2 text-sm text-gray-300">Type</th>
                <th className="px-4 py-2 text-sm text-gray-300">Value</th>
                <th className="px-4 py-2 text-sm text-gray-300">Uses</th>
                <th className="px-4 py-2 text-sm text-gray-300">Expires</th>
                <th className="px-4 py-2 text-sm text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-700">
                  <td className="px-4 py-2 text-white font-mono">{coupon.code}</td>
                  <td className="px-4 py-2 text-gray-300 capitalize">{coupon.type}</td>
                  <td className="px-4 py-2 text-gray-300">{coupon.type === 'fixed' ? `$${(coupon.value / 100).toFixed(2)}` : `${coupon.value}%`}</td>
                  <td className="px-4 py-2 text-gray-300">{coupon.used_count}{coupon.usage_limit > 0 ? ` / ${coupon.usage_limit}` : ''}</td>
                  <td className="px-4 py-2 text-gray-300">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing(coupon)} className="text-blue-400 hover:text-blue-300 text-sm mr-3">Edit</button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}