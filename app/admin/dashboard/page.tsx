import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AddProductButtonWrapper from '../components/AddProductButtonWrapper'
import EditProductButton from '../components/EditProductButton'
import DeleteProductButton from '../components/DeleteProductButton'
import AddSlideButton from '../components/AddSlideButton'
import SlidesList from '../components/SlidesList'
import InboxList from '../components/InboxList'
import ProductSortableList from '../components/ProductSortableList'
import OrdersList from '../components/OrdersList'
import ReviewsList from '../components/ReviewsList'
import WaitlistList from '../components/WaitlistList'
import CouponManager from '../components/CouponManager'

export const revalidate = 0

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

  // Fetch slides
  const { data: slides } = await supabase
    .from('slides')
    .select('*')
    .order('display_order', { ascending: true })

  // Fetch inquiries
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch waitlist
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*, products(name)')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-unifraktur text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage your products, slides, orders, and customer inquiries.</p>

        {/* PRODUCTS */}
        <h2 className="text-2xl font-unifraktur text-white mb-4">Products</h2>
        <div className="mb-4">
          <AddProductButtonWrapper />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-12">
          <div className="overflow-x-auto p-4">
            <ProductSortableList products={products || []} />
          </div>
        </div>

        {/* SLIDESHOW */}
        <h2 className="text-2xl font-unifraktur text-white mb-4">Slideshow</h2>
        <div className="mb-4">
          <AddSlideButton />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-12">
          <SlidesList slides={slides || []} />
        </div>

        {/* ORDERS */}
        <h2 className="text-2xl font-unifraktur text-white mb-4 mt-12">Orders</h2>
        <p className="text-gray-400 text-sm mb-4">Manage customer orders and update fulfillment status.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-12">
          <OrdersList orders={orders || []} />
        </div>

        {/* WAITLIST */}
        <h2 className="text-2xl font-unifraktur text-white mb-4 mt-12">Waitlist</h2>
        <p className="text-gray-400 text-sm mb-4">Customers who want to be notified when items are back in stock.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-12">
          <WaitlistList entries={waitlist || []} />
        </div>

        {/* INBOX */}
        <h2 className="text-2xl font-unifraktur text-white mb-4 mt-12">Inbox</h2>
        <p className="text-gray-400 text-sm mb-4">Customer messages from the Contact page.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-12">
          <InboxList inquiries={inquiries || []} />
        </div>

        {/* ✅ REVIEWS */}
        <h2 className="text-2xl font-unifraktur text-white mb-4 mt-12">Reviews</h2>
        <p className="text-gray-400 text-sm mb-4">Approve or delete customer reviews.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <ReviewsList />
        </div>

        {/* COUPONS */}
        <h2 className="text-2xl font-unifraktur text-white mb-4 mt-12">Discount Codes</h2>
        <p className="text-gray-400 text-sm mb-4">Create and manage coupon codes for promotions.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <CouponManager />
        </div>

      </div>
    </main>
  )
}