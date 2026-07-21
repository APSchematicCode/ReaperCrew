import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AddProductButtonWrapper from '../components/AddProductButtonWrapper'
import EditProductButton from '../components/EditProductButton'
import DeleteProductButton from '../components/DeleteProductButton'
import AddSlideButton from '../components/AddSlideButton'
import SlidesList from '../components/SlidesList'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch slides (ordered by display_order)
  const { data: slides } = await supabase
    .from('slides')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-unifraktur text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage your products and slides.</p>

        {/* ========== PRODUCTS SECTION ========== */}
        <h2 className="text-2xl font-unifraktur text-white mb-4">Products</h2>
        <div className="mb-8">
          <AddProductButtonWrapper />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Price</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Pre-Order</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3 text-white">{product.name}</td>
                      <td className="px-4 py-3 text-gray-300">${(product.price / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{product.product_type}</td>
                      <td className="px-4 py-3">
                        {product.is_pre_order ? (
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full">Yes</span>
                        ) : (
                          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditProductButton product={product} />
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== SLIDESHOW SECTION ========== */}
        <h2 className="text-2xl font-unifraktur text-white mb-4">Slideshow</h2>
        <p className="text-gray-400 text-sm mb-4">Manage the homepage carousel images. (Recommended: wide landscape images, e.g. 1400x600)</p>
        <div className="mb-4">
          <AddSlideButton />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <SlidesList slides={slides || []} />
        </div>
      </div>
    </main>
  )
}