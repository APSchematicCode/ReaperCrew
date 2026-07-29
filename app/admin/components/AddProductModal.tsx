'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded: () => void
}

type ImageMetadata = Record<string, { width: number; height: number }>

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [productType, setProductType] = useState('merch')
  const [isPreOrder, setIsPreOrder] = useState(false)
  const [estimatedShipDate, setEstimatedShipDate] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [variants, setVariants] = useState<{ key: string; value: number }[]>([])
  const [popularity, setPopularity] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>({})
  const [outOfStock, setOutOfStock] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(newFiles)

      const metadata: ImageMetadata = {}
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new window.Image()
          img.onload = () => {
            metadata[file.name] = { width: img.naturalWidth, height: img.naturalHeight }
            setImageMetadata({ ...imageMetadata, ...metadata })
          }
          img.src = event.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const addVariant = () => setVariants([...variants, { key: '', value: 0 }])
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index))
  
  // ✅ CAPITALIZATION FIX: Forces first letter of variant key to uppercase
  const updateVariantKey = (index: number, key: string) => {
    const newVariants = [...variants]
    newVariants[index].key = key.charAt(0).toUpperCase() + key.slice(1)
    setVariants(newVariants)
  }

  const updateVariantValue = (index: number, value: number) => {
    const newVariants = [...variants]
    const finalValue = productType === 'service' ? Math.round(value * 100) : value
    newVariants[index].value = finalValue
    setVariants(newVariants)
  }

  const uploadImages = async (): Promise<{ urls: string[]; metadata: ImageMetadata }> => {
    const uploadedUrls: string[] = []
    const metadata: ImageMetadata = {}

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file)
      if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath)
      uploadedUrls.push(publicUrl)

      if (imageMetadata[file.name]) {
        metadata[publicUrl] = imageMetadata[file.name]
      }
    }
    return { urls: uploadedUrls, metadata }
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

    const variantsJson = variants.reduce((acc, v) => {
      if (v.key) acc[v.key] = v.value
      return acc
    }, {} as Record<string, number>)

    let imageUrls: string[] = []
    let metadata: ImageMetadata = {}
    if (files.length > 0) {
      try {
        const result = await uploadImages()
        imageUrls = result.urls
        metadata = result.metadata
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
        return
      }
    }

    setUploadProgress('Saving product...')

    const { error: insertError } = await supabase.from('products').insert({
      name,
      description,
      price: priceInCents,
      product_type: productType,
      is_pre_order: isPreOrder,
      estimated_ship_date: isPreOrder ? estimatedShipDate : null,
      images_json: imageUrls,
      variants_json: variantsJson,
      popularity: popularity,
      image_metadata: metadata,
      out_of_stock: outOfStock,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onProductAdded()
    onClose()
    setName('')
    setDescription('')
    setPrice('')
    setProductType('merch')
    setIsPreOrder(false)
    setEstimatedShipDate('')
    setFiles([])
    setVariants([])
    setPopularity(0)
    setImageMetadata({})
    setOutOfStock(false)
  }

  const isService = productType === 'service'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-unifraktur text-white mb-4">Add New Product</h2>
        {error && <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
        {uploadProgress && loading && <div className="text-blue-400 text-sm mb-2">{uploadProgress}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Base Price (USD) *</label>
            <input type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500" placeholder="49.99" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Type</label>
            <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500">
              <option value="merch">Merch (Physical)</option>
              <option value="service">Service (Media Package)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Popularity</label>
            <input type="number" value={popularity} onChange={(e) => setPopularity(parseInt(e.target.value) || 0)} className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500" placeholder="e.g., 100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{isService ? 'Package Options (Name + Extra Price)' : 'Variants (Size + Stock)'}</label>
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder={isService ? 'Package name' : 'Size'}
                  value={variant.key}
                  onChange={(e) => updateVariantKey(index, e.target.value)}
                  className="w-1/2 px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
                />
                <input
                  type="number"
                  step={isService ? "0.01" : "1"}
                  min="0"
                  placeholder={isService ? 'Extra price' : 'Stock'}
                  value={isService ? (variant.value / 100).toFixed(2) : variant.value}
                  onChange={(e) => updateVariantValue(index, parseFloat(e.target.value) || 0)}
                  className="w-1/3 px-3 py-1.5 bg-black border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-500"
                />
                <span className={`text-xs font-semibold px-2 py-1 rounded ${variant.value <= 0 ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                  {variant.value <= 0 ? 'OOS' : 'In Stock'}
                </span>
                <button type="button" onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="text-sm text-blue-400 hover:text-blue-300">+ Add Variant</button>
            <p className="text-gray-500 text-xs mt-1">{isService ? 'Extra price added to base price.' : 'Stock quantity for this size.'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Images</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700" />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((file, idx) => (
                  <div key={idx} className="relative w-16 h-16 bg-gray-800 rounded border border-gray-700 overflow-hidden">
                    <Image src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                    {imageMetadata[file.name] && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center">
                        {imageMetadata[file.name].width}×{imageMetadata[file.name].height}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="outOfStock"
              checked={outOfStock}
              onChange={(e) => setOutOfStock(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="outOfStock" className="text-sm text-gray-300">Mark entire product as Out of Stock (overrides variants)</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPreOrder" checked={isPreOrder} onChange={(e) => setIsPreOrder(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="isPreOrder" className="text-sm text-gray-300">This is a Pre-Order item</label>
          </div>

          {isPreOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Ship Date</label>
              <input type="text" value={estimatedShipDate} onChange={(e) => setEstimatedShipDate(e.target.value)} placeholder="e.g. Will start shipping in 4-6 weeks" className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50">{loading ? 'Adding...' : 'Add Product'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}