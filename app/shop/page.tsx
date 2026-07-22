import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'

export default async function ShopPage() {
  // Fetch products from Supabase
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-unifraktur text-white mb-4">Shop</h1>
        <p className="text-gray-400 mb-8">Browse our gear and media packages.</p>
        <ProductGrid products={products || []} />
      </div>
    </main>
  )
}
export const revalidate = 0 // Always fetch fresh data on every request