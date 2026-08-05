import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Helper to chunk array into smaller arrays
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export async function POST(req: Request) {
  try {
    // 1. Check if user is admin
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

    // 2. Get request body
    const body = await req.json()
    const { subject, htmlContent } = body

    if (!subject || !htmlContent) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 })
    }

    // 3. Fetch all newsletter subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email')

    if (fetchError) {
      console.error('Failed to fetch subscribers:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 })
    }

    const emails = subscribers.map((s) => s.email)

    // 4. Prepare Brevo API
    const brevoKey = process.env.BREVO_API_KEY
    if (!brevoKey) {
      return NextResponse.json({ error: 'BREVO_API_KEY is not set' }, { status: 500 })
    }

    // 5. Build the email HTML with image scaling and responsive container
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    img { max-width: 100%; height: auto; display: block; }
    p { margin: 0 0 10px 0; line-height: 1.6; }
    h1, h2, h3 { margin: 0 0 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    ${htmlContent}
  </div>
</body>
</html>
    `

    // 6. Chunk emails (Brevo allows 50 recipients per call)
    const chunks = chunkArray(emails, 50)
    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // 7. Send to each chunk
    for (const chunk of chunks) {
      const to = chunk.map((email) => ({ email }))

      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': brevoKey,
          },
          body: JSON.stringify({
            // ✅ Update this sender email to his verified Brevo sender
            sender: { email: 'noreply@reapercrew.com', name: 'Reaper Crew' },
            to: to,
            subject: subject,
            htmlContent: emailHtml,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          errors.push(`Chunk failed: ${errorText}`)
          failedCount += chunk.length
        } else {
          successCount += chunk.length
        }
      } catch (err: any) {
        errors.push(err.message)
        failedCount += chunk.length
      }
    }

    return NextResponse.json({
      success: true,
      total: emails.length,
      sent: successCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}