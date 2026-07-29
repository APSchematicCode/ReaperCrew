import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import { redirect } from 'next/navigation'




interface SearchParams {
  search?: string
  type?: string
  sort?: string
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { search, type, sort } = await searchParams

  let query = supabase.from('products').select('*')

  // 1. Search (name or description)
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // 2. Filter by type
  if (type && type !== 'all') {
    query = query.eq('product_type', type)
  }

  // 3. Sorting
  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'popularity') {
    query = query.order('popularity', { ascending: false })
  } else {
    query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false })
  }

  const { data: products, error: productsError } = await query

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-unifraktur text-white mb-4">Shop</h1>
        <p className="text-gray-400 mb-8">Browse our gear and media packages.</p>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <form action="/shop" method="GET" className="flex-1 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={search || ''}
              className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            />
            <select
              name="type"
              defaultValue={type || 'all'}
              className="px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              <option value="all">All Types</option>
              <option value="merch">Merch</option>
              <option value="service">Media Packages</option>
            </select>
            <select
              name="sort"
              defaultValue={sort || 'default'}
              className="px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              <option value="default">Sort by: Default</option>
              <option value="popularity">Sort by: Popularity</option>
              <option value="price-asc">Sort by: Price (Low to High)</option>
              <option value="price-desc">Sort by: Price (High to Low)</option>
            </select>
            <button type="submit" className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200 transition">
              Apply
            </button>
          </form>
          {(search || type || sort) && (
            <a href="/shop" className="text-gray-400 hover:text-white text-sm flex items-center">
              Clear Filters
            </a>
          )}
        </div>

        <ProductGrid products={products || []} />
      </div>
    </main>
  )
}
export const revalidate = 0 // Always fetch fresh data on every request