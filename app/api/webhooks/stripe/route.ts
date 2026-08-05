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



async function sendOrderConfirmationEmail(customerEmail: string, customerName: string, orderId: string, items: any[], totalCents: number) {
  const brevoKey = process.env.BREVO_API_KEY
  if (!brevoKey) {
    console.error('BREVO_API_KEY is not set – skipping email')
    return
  }

  const itemsHtml = items.map((item) => `
    <tr>
      <td>${item.name} (${item.variant})</td>
      <td>× ${item.quantity}</td>
      <td>$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('')

  const totalDollars = (totalCents / 100).toFixed(2)

  const htmlContent = `
    <h1>Thank you for your order, ${customerName}!</h1>
    <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been confirmed.</p>
    <h3>Order Summary</h3>
    <table border="1" cellpadding="5">
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${itemsHtml}
      <tr><td colspan="2"><strong>Total</strong></td><td><strong>$${totalDollars}</strong></td></tr>
    </table>
    <p>We'll notify you when your order ships.</p>
    <p>– Reaper Crew</p>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoKey,
      },
      body: JSON.stringify({
        sender: { email: 'noreply@reapercrew.com', name: 'Reaper Crew' },
        to: [{ email: customerEmail, name: customerName }],
        subject: `Order Confirmation #${orderId.slice(0, 8)}`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Brevo email failed:', errorText)
    } else {
      console.log(`✅ Confirmation email sent to ${customerEmail}`)
    }
  } catch (err: any) {
    console.error('Brevo error:', err.message)
  }
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

      if (!meta || !meta.items) {
        console.error('Missing order metadata in session')
        return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
      }

      try {
        const supabase = getSupabaseAdmin()

        // Parse compact items: [{id, variant, qty}]
        const compactItems = JSON.parse(meta.items)
        const productIds = compactItems.map((item: any) => item.id)

        // Fetch product details from Supabase
        const { data: products, error: fetchError } = await supabase
          .from('products')
          .select('id, name, price, product_type')
          .in('id', productIds)

        if (fetchError) {
          console.error('Failed to fetch products:', fetchError)
          return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
        }

        // Build full items with prices
        const fullItems = compactItems.map((ci: any) => {
          const product = products?.find((p: any) => p.id === ci.id)
          return {
            id: ci.id,
            name: product?.name || 'Unknown Product',
            variant: ci.variant,
            price: product?.price || 0,
            quantity: ci.qty,
          }
        })

        const totalCents = parseInt(meta.total_cents)
        const discountCents = parseInt(meta.discount_cents || '0')
        const couponCode = meta.coupon_code || null
        const originalTotal = parseInt(meta.original_total || String(totalCents + discountCents))
        const shippingCents = parseInt(meta.shipping_cents || '0')

        const orderData = {
          customer_email: session.customer_details?.email || session.customer_email || 'guest@example.com',
          customer_name: session.customer_details?.name || 'Guest',
          items_json: fullItems,
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


        await sendOrderConfirmationEmail(
          orderData.customer_email,
          orderData.customer_name || 'Customer',
          order.id,
          fullItems,
          totalCents
        )

        
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