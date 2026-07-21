'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddSlideButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an image.')
      return
    }

    setLoading(true)
    setError('')

    // 1. Upload image to Supabase Storage
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

    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('slides')
      .getPublicUrl(filePath)

    // 3. Insert into slides table
    const { error: insertError } = await supabase
      .from('slides')
      .insert({
        image_url: publicUrl,
        link_url: linkUrl || null,
        display_order: 0, // We'll fix ordering on page load
      })

    if (insertError) {
      setError(`Database error: ${insertError.message}`)
      // Clean up storage if DB fails? Too complex for now, but it's fine.
      setLoading(false)
      return
    }

    setLoading(false)
    setIsModalOpen(false)
    setFile(null)
    setLinkUrl('')
    // Reload to show new slide
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
            <h2 className="text-2xl font-unifraktur text-white mb-4">Add New Slide</h2>

            {error && (
              <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

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
                <p className="text-gray-500 text-xs mt-1">Recommended: Wide landscape (e.g., 1400x600). Will crop to fit.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Link URL (Optional)</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g., /shop or https://..."
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
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