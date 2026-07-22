import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AddProductButtonWrapper from '../components/AddProductButtonWrapper'
import EditProductButton from '../components/EditProductButton'
import DeleteProductButton from '../components/DeleteProductButton'
import AddSlideButton from '../components/AddSlideButton'
import SlidesList from '../components/SlidesList'
import ProductSortableList from '../components/ProductSortableList'

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
    .order('display_order', { ascending: true })
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

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
            <ProductSortableList products={products || []} />
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