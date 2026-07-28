import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia', // or use the latest stable
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event

  try {
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
      const orderId = session.metadata?.order_id

      if (!orderId) {
        console.error('No order_id in session metadata')
        return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
      }

      // ✅ Use type assertion to access shipping property (bypass TypeScript)
      const shippingAddress = (session as any).shipping?.address || null

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent,
          customer_email: session.customer_details?.email || session.customer_email,
          customer_name: session.customer_details?.name || null,
          shipping_address: shippingAddress,
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Failed to update order:', updateError)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
      }

      console.log(`✅ Order ${orderId} marked as paid.`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}