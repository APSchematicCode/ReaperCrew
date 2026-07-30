import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const handleLogout = async () => {
    'use server'
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-old-english text-white">My Account</h1>
          <form action={handleLogout}>
            <button type="submit" className="text-red-400 hover:text-red-300 text-sm">
              Logout
            </button>
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <p className="text-gray-300">Signed in as <span className="text-white font-medium">{session.user.email}</span></p>
        </div>

        <h2 className="text-2xl font-old-english text-white mb-4">Order History</h2>
        {orders && orders.length > 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Order</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Total</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white font-mono text-sm">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-white">${(order.total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        order.status === 'completed' ? 'bg-green-900 text-green-300' :
                        order.status === 'shipped' ? 'bg-purple-900 text-purple-300' :
                        order.status === 'paid' ? 'bg-blue-900 text-blue-300' :
                        order.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center text-gray-400">
            You haven't placed any orders yet.
            <br />
            <Link href="/shop" className="text-white hover:underline">Start shopping</Link>
          </div>
        )}
      </div>
    </main>
  )
}