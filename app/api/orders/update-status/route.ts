import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderStatusEmail } from '@/lib/email'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase URL or Service Role Key is missing')
  }
  return createClient(url, key)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, newStatus } = body

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing orderId or newStatus' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Fetch the current order details (including items and customer email)
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      console.error('Failed to fetch order:', fetchError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2. Update the status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // 3. Send email notification
    await sendOrderStatusEmail(
      order.customer_email,
      order.customer_name || 'Customer',
      order.id,
      newStatus,
      order.items_json,
      order.total_cents
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}