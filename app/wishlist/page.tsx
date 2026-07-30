import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'

export default async function WishlistPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: wishlist } = await supabase
    .from('wishlist')
    .select('*, products(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-old-english text-white mb-8">My Wishlist</h1>

        {!wishlist || wishlist.length === 0 ? (
          <div className="text-gray-400 text-center py-16">
            <p>Your wishlist is empty.</p>
            <Link href="/shop" className="text-white hover:underline mt-2 inline-block">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition">
                <Link href={`/product/${item.products.id}`}>
                  <div className="relative h-64 w-full bg-gray-800">
                    <Image
                      src={item.products.images_json?.[0] || '/placeholder.svg'}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-white">{item.products.name}</h3>
                  <p className="text-gray-400 text-sm">{item.variant || 'Default'}</p>
                  <p className="text-lg font-bold text-white mt-2">${(item.products.price / 100).toFixed(2)}</p>
                  <Link href={`/shop`} className="mt-3 block text-center bg-white text-black py-2 rounded hover:bg-gray-200 transition">
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}