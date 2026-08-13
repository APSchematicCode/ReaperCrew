import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { productId, variant, emails } = await req.json()
    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'No emails to notify' }, { status: 400 })
    }

    const brevoKey = process.env.BREVO_API_KEY
    if (!brevoKey) {
      return NextResponse.json({ error: 'BREVO_API_KEY missing' }, { status: 500 })
    }

    // Get product name
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single()

    const productName = product?.name || 'Product'

    // Send email via Brevo
    const to = emails.map((email: string) => ({ email }))
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
      body: JSON.stringify({
        sender: { email: 'angelpersonal3@gmail.com', name: 'Reaper Crew' },
        to: to,
        subject: `Back in Stock: ${productName} (${variant})`,
        htmlContent: `<p>Good news! The <strong>${productName}</strong> (${variant}) is back in stock. <a href="${process.env.NEXT_PUBLIC_BASE_URL}/shop">Shop now</a>.</p>`,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Brevo error: ${errorText}` }, { status: 500 })
    }

    // Delete waitlist entries after notifying (clean up)
    const { error: deleteError } = await supabase
      .from('waitlist')
      .delete()
      .eq('product_id', productId)
      .eq('variant', variant)

    if (deleteError) {
      console.error('Failed to delete waitlist entries:', deleteError)
    }

    return NextResponse.json({ sent: emails.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}