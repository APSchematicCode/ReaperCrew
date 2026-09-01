import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import Slideshow from '@/components/Slideshow'

export const revalidate = 0

export default async function Home() {
  // 1. Get top 3 product IDs by actual sales
  const { data: topProducts, error: rpcError } = await supabase
    .rpc('get_top_selling_products', { limit_count: 3 })

  if (rpcError) {
    console.error('Error fetching top products:', rpcError)
  }

  let productIds: string[] = []
  if (topProducts && topProducts.length > 0) {
    productIds = topProducts.map((p: any) => p.product_id)
  }

  let products: any[] = []

  if (productIds.length > 0) {
    // 2. Fetch full product details for those IDs
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!error && data) {
      // 3. Preserve the order from the sales query
      const productMap = new Map(data.map((p: any) => [p.id, p]))
      products = productIds.map((id) => productMap.get(id)).filter(Boolean)
    }
  }

  // 4. Fallback: if no orders exist yet, show the admin's drag‑and‑drop order
  if (products.length === 0) {
    const { data: fallback, error: fallbackError } = await supabase
      .from('products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(3)

    if (!fallbackError) {
      products = fallback || []
    }
  }

  // Fetch slides (unchanged)
  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select('*')
    .order('display_order', { ascending: true })

  if (slidesError) {
    console.error('Error fetching slides:', slidesError)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <Slideshow slides={slides || []} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-oldenglish text-white mb-8">Best Sellers</h2>
        <ProductGrid products={products || []} />
      </div>
    </main>
  )
}