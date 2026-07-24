import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import Slideshow from '@/components/Slideshow'

export default async function Home() {
  // ✅ Top 3 products by popularity (highest first)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('popularity', { ascending: false })
    .order('display_order', { ascending: true })
    .limit(3)

  const { data: slides, error: slidesError } = await supabase
    .from('slides')
    .select('*')
    .order('display_order', { ascending: true })

  if (productsError) console.error('Error fetching products:', productsError)
  if (slidesError) console.error('Error fetching slides:', slidesError)

  return (
    <main className="min-h-screen">
      <Header />
      <Slideshow slides={slides || []} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-unifraktur text-white mb-8">Shop Our Gear</h2>
        <ProductGrid products={products || []} />
      </div>
    </main>
  )
}
