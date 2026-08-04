import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, totalCents, couponCode, discountCents, shippingCents } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const stripe = getStripe()

    // 1. Build line items
    const lineItems = items.map((item: any) => {
      const unitPrice = Math.round(item.price)
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

    // 2. Handle discount by creating a Stripe coupon
    let discounts: { coupon: string }[] = []
    if (discountCents && discountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountCents),
        currency: 'usd',
        duration: 'once',
        name: couponCode || 'Discount',
      })
      discounts = [{ coupon: coupon.id }]
    }

    // 3. Build the session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const compactItems = items.map((item: any) => ({
      id: item.id,
      variant: item.variant,
      qty: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?canceled=true`,
      metadata: {
        items: JSON.stringify(compactItems),
        total_cents: String(Math.round(totalCents)),
        discount_cents: String(Math.round(discountCents || 0)),
        coupon_code: couponCode || '',
        original_total: String(Math.round(totalCents + (discountCents || 0))),
        shipping_cents: String(Math.round(shippingCents || 0)),
      },
      discounts: discounts.length > 0 ? discounts : undefined,
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