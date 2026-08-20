'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddSlideButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Read the image to get natural dimensions
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(selectedFile)

    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an image.')
      return
    }
    if (!imageDimensions) {
      setError('Could not read image dimensions. Please try another file.')
      return
    }

    setLoading(true)
    setError('')

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `slides/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('slides')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('slides')
      .getPublicUrl(filePath)

    // 2. Insert into slides table WITH width and height
    const { error: insertError } = await supabase
      .from('slides')
      .insert({
        image_url: publicUrl,
        link_url: linkUrl || null,
        display_order: 0,
        width: imageDimensions.width,
        height: imageDimensions.height,
      })

    if (insertError) {
      setError(`Database error: ${insertError.message}`)
      setLoading(false)
      return
    }

    setLoading(false)
    setIsModalOpen(false)
    setFile(null)
    setLinkUrl('')
    setImageDimensions(null)
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition"
      >
        + Add Slide
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6">
            <h2 className="text-2xl old-english text-white mb-4">Add New Slide</h2>
            {error && <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                />
                {imageDimensions && (
                  <p className="text-gray-400 text-xs mt-1">Detected: {imageDimensions.width}×{imageDimensions.height}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Link URL (Optional)</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g., /shop"
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50">
                  {loading ? 'Uploading...' : 'Add Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}