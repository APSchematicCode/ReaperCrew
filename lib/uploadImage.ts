import { supabase } from '@/lib/supabase'

export async function uploadImageToSupabase(file: File, folder: 'newsletter' | 'blog' | 'general' = 'general'): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('newsletter') // You can change this bucket name
    .upload(filePath, file)

  if (uploadError) {
    console.error('Image upload failed:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('newsletter')
    .getPublicUrl(filePath)

  return publicUrl
}