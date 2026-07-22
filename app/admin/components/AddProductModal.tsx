'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded: () => void
}

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [productType, setProductType] = useState('merch')
  const [isPreOrder, setIsPreOrder] = useState(false)
  const [estimatedShipDate, setEstimatedShipDate] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUploadProgress('Uploading images...')

    const priceInCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Please enter a valid price.')
      setLoading(false)
      return
    }

    let imageUrls: string[] = []
    if (files.length > 0) {
      try {
        imageUrls = await uploadImages()
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
        return
      }
    }

    setUploadProgress('Saving product...')

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: priceInCents,
        product_type: productType,
        is_pre_order: isPreOrder,
        estimated_ship_date: isPreOrder ? estimatedShipDate : null,
        images_json: imageUrls,
        variants_json: {},
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onProductAdded()
    onClose()
    // Reset form
    setName('')
    setDescription('')
    setPrice('')
    setProductType('merch')
    setIsPreOrder(false)
    setEstimatedShipDate('')
    setFiles([])
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-unifraktur text-white mb-4">Add New Product</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {uploadProgress && loading && (
          <div className="text-blue-400 text-sm mb-2">{uploadProgress}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              placeholder="49.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Type</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              <option value="merch">Merch (Physical)</option>
              <option value="service">Service (Media Package)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
            />
            {/* Image Preview */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((file, idx) => (
                  <div key={idx} className="relative w-16 h-16 bg-gray-800 rounded border border-gray-700 overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <p className="w-full text-gray-400 text-xs mt-1">{files.length} image(s) selected. First image will be the main photo.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPreOrder"
              checked={isPreOrder}
              onChange={(e) => setIsPreOrder(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isPreOrder" className="text-sm text-gray-300">This is a Pre-Order item</label>
          </div>

          {isPreOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Ship Date</label>
              <input
                type="text"
                value={estimatedShipDate}
                onChange={(e) => setEstimatedShipDate(e.target.value)}
                placeholder="e.g. Ships in 4-6 weeks"
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}