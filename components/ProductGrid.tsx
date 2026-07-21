import Image from 'next/image'

type Product = {
  id: string
  name: string
  description: string
  price: number
  product_type: 'merch' | 'service'
  is_pre_order: boolean
  estimated_ship_date?: string
  images_json: string[]
  variants_json: any
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return <div className="text-gray-400">No products available</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition">
          <div className="relative h-64 w-full bg-gray-800">
            {/* Placeholder image that won't break */}
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {product.name}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-white">{product.name}</h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-white">${(product.price / 100).toFixed(2)}</span>
              {product.is_pre_order && (
                <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full uppercase font-semibold">
                  Pre-Order
                </span>
              )}
              {product.product_type === 'service' && (
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full uppercase font-semibold">
                  Custom
                </span>
              )}
            </div>
            {product.is_pre_order && product.estimated_ship_date && (
              <p className="text-xs text-gray-400 mt-2">Ships: {product.estimated_ship_date}</p>
            )}
            <button className="mt-4 w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition font-medium text-sm">
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}