'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Order = {
  id: string
  customer_email: string
  customer_name: string | null
  total_cents: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items_json: any
  created_at: string
}

interface OrdersListProps {
  orders: Order[]
}

export default function OrdersList({ orders }: OrdersListProps) {
  const [items, setItems] = useState(orders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const updateStatus = async (id: string, newStatus: Order['status']) => {
    setLoadingId(id)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Failed to update status.')
      setLoadingId(null)
      return
    }

    setItems(items.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ))
    setLoadingId(null)
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900 text-yellow-300'
      case 'paid': return 'bg-blue-900 text-blue-300'
      case 'shipped': return 'bg-purple-900 text-purple-300'
      case 'completed': return 'bg-green-900 text-green-300'
      case 'cancelled': return 'bg-red-900 text-red-300'
    }
  }

  if (items.length === 0) {
    return <div className="text-gray-400 p-6 text-center">No orders yet.</div>
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Order</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Customer</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Total</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300">Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 text-white text-sm font-mono">#{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <p className="text-white">{order.customer_name || 'Guest'}</p>
                  <p className="text-gray-400 text-xs">{order.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-white font-bold">${(order.total_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-3"
                  >
                    View
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                    disabled={loadingId === order.id}
                    className="bg-black border border-gray-700 rounded text-white text-sm px-2 py-1 focus:outline-none focus:border-gray-500 disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-800">
        {items.map((order) => (
          <div key={order.id} className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-white font-mono text-sm">#{order.id.slice(0, 8)}</span>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-white">{order.customer_name || 'Guest'}</p>
            <p className="text-gray-400 text-sm">{order.customer_email}</p>
            <p className="text-white font-bold">${(order.total_cents / 100).toFixed(2)}</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setSelectedOrder(order)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View Details
              </button>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                disabled={loadingId === order.id}
                className="bg-black border border-gray-700 rounded text-white text-xs px-2 py-1 focus:outline-none focus:border-gray-500 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-unifraktur text-white">Order #{selectedOrder.id.slice(0, 8)}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Customer</p>
                  <p className="text-white">{selectedOrder.customer_name || 'Guest'}</p>
                  <p className="text-gray-300 text-sm">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize inline-block mt-1 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Items</p>
                <div className="bg-black/30 rounded-lg border border-gray-700 divide-y divide-gray-700">
                  {selectedOrder.items_json.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white">{item.name}</p>
                        <p className="text-gray-400 text-sm">Variant: {item.variant} × {item.quantity}</p>
                      </div>
                      <p className="text-white font-bold">${(item.price / 100).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3">
                <span className="text-white">Total</span>
                <span className="text-white">${(selectedOrder.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}