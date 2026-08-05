export async function uploadImageToSupabase(file: File, folder: 'newsletter' | 'blog' | 'general' = 'general'): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  try {
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Upload API error:', data.error)
      return null
    }

    return data.url
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  }
}