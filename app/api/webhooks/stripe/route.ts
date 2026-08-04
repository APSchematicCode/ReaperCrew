import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase URL or Service Role Key is missing')
  }
  return createClient(url, key)
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const meta = session.metadata

      if (!meta || !meta.items_json) {
        console.error('Missing order metadata in session')
        return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
      }

      try {
        const supabase = getSupabaseAdmin()

        // ✅ Parse order data from metadata
        const items = JSON.parse(meta.items_json)
        const totalCents = parseInt(meta.total_cents)
        const discountCents = parseInt(meta.discount_cents || '0')
        const couponCode = meta.coupon_code || null
        const originalTotal = parseInt(meta.original_total || String(totalCents + discountCents))
        const shippingCents = parseInt(meta.shipping_cents || '0')

        const orderData = {
          customer_email: session.customer_details?.email || session.customer_email || 'guest@example.com',
          customer_name: session.customer_details?.name || 'Guest',
          items_json: items,
          total_cents: totalCents,
          original_total_cents: originalTotal,
          discount_cents: discountCents,
          coupon_code: couponCode,
          stripe_payment_intent_id: session.payment_intent,
          shipping_address: (session as any).shipping?.address || null,
          status: 'paid',
        }

        const { data: order, error: insertError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single()

        if (insertError) {
          console.error('Failed to insert order:', insertError)
          return NextResponse.json({ error: 'Failed to insert order' }, { status: 500 })
        }

        console.log(`✅ Order ${order.id} created and marked as paid.`)
      } catch (err: any) {
        console.error('Error processing webhook:', err.message)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}