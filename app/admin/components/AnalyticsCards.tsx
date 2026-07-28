'use client'

type AnalyticsData = {
  totalRevenue: number
  totalOrders: number
  bestSellers: { name: string; total: number }[]
  monthlyRevenue: number
}

export default function AnalyticsCards({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400 text-sm">Total Revenue</p>
        <p className="text-2xl font-bold text-white">${(data.totalRevenue / 100).toFixed(2)}</p>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400 text-sm">This Month</p>
        <p className="text-2xl font-bold text-white">${(data.monthlyRevenue / 100).toFixed(2)}</p>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400 text-sm">Total Orders</p>
        <p className="text-2xl font-bold text-white">{data.totalOrders}</p>
      </div>

      {data.bestSellers.length > 0 && (
        <div className="md:col-span-3 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Best Sellers</p>
          <div className="flex flex-wrap gap-3">
            {data.bestSellers.map((item, idx) => (
              <span key={idx} className="bg-gray-700 px-3 py-1 rounded-full text-white text-sm">
                {item.name} <span className="text-gray-400">({item.total} sold)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}