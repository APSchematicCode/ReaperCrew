import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('newsletter')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('newsletter')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}