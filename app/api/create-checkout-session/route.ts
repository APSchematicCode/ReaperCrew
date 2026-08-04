import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js' // ✅ Use direct client with service role

// ✅ Lazy initializers
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  })
}

// ✅ Supabase Admin Client (bypasses RLS)
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
    const supabase = getSupabaseAdmin() // ✅ Service role client

    // Get user info (optional, for logging)
    const authHeader = req.headers.get('authorization')
    let userEmail = 'guest@example.com'
    let userId = null

    // We don't have the session token here easily, so we'll just use guest.
    // But we can read the body first.

    const body = await req.json()
    const { items, totalCents, couponCode, discountCents, shippingCents } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 1. Create a pending order in Supabase (bypasses RLS)
    const orderData: any = {
      user_id: null, // We'll set this to null for guests (or we can try to fetch user from session if needed)
      customer_email: 'guest@example.com',
      customer_name: 'Guest',
      items_json: items,
      total_cents: totalCents,
      original_total_cents: totalCents + (discountCents || 0),
      discount_cents: discountCents || 0,
      coupon_code: couponCode || null,
      status: 'pending',
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json({ error: `Failed to create order: ${orderError.message}` }, { status: 500 })
    }

    // 2. Create Stripe Checkout Session
    const stripe = getStripe()

    const lineItems = items.map((item: any) => {
      const unitPrice = Math.round(item.price / item.quantity)
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} (${item.variant})`,
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      }
    })

    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping (Flat Rate)' },
          unit_amount: shippingCents,
        },
        quantity: 1,
      })
    }

    if (discountCents && discountCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Discount ${couponCode ? `(${couponCode})` : ''}` },
          unit_amount: -discountCents,
        },
        quantity: 1,
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?canceled=true`,
      metadata: {
        order_id: order.id,
      },
      // We'll let Stripe collect email or we can pass it
      customer_email: userEmail === 'guest@example.com' ? undefined : userEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}