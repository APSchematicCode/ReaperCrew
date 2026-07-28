import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia', // Use the latest stable version
})

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { items, totalCents, couponCode, discountCents, shippingCents } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 1. Create a pending order in Supabase (so we have an ID to reference)
    const orderData: any = {
      user_id: user?.id || null,
      customer_email: user?.email || 'guest@example.com',
      customer_name: user?.user_metadata?.name || 'Guest',
      items_json: items,
      total_cents: totalCents,
      original_total_cents: totalCents + discountCents,
      discount_cents: discountCents || 0,
      coupon_code: couponCode || null,
      status: 'pending', // Will be updated to 'paid' by webhook
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // 2. Create Stripe Checkout Session
    const lineItems = items.map((item: any) => {
      const unitAmount = Math.round(item.price / item.quantity) // price is total price for all quantities in the cart item
      // Actually, item.price is the unit price (I need to check the cart structure).
      // In our cart, item.price is the total price for that line item? Let's assume each item has a price per unit.
      // Let's calculate safely: if item.quantity > 1, divide.
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

    // Add shipping as a separate line item if it's > 0
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping (Flat Rate)',
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      })
    }

    // Add discount as a negative line item if it's > 0
    if (discountCents && discountCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Discount ${couponCode ? `(${couponCode})` : ''}`,
          },
          unit_amount: -discountCents, // ✅ Negative amount for discount
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
      customer_email: user?.email || undefined,
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