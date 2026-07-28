'use client'

import { useState } from 'react'

interface SizeGuideModalProps {
  productSpecs?: Record<string, string>
}

export default function SizeGuideModal({ productSpecs = {} }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-gray-400 hover:text-white transition underline"
      >
        Size Guide
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-unifraktur text-white">Size Guide</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Static size chart (customize per brand) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-3 py-2 text-gray-300">Size</th>
                  <th className="px-3 py-2 text-gray-300">Chest (in)</th>
                  <th className="px-3 py-2 text-gray-300">Waist (in)</th>
                  <th className="px-3 py-2 text-gray-300">Sleeve (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800"><td className="px-3 py-2 text-white">S</td><td className="px-3 py-2 text-gray-300">34-36</td><td className="px-3 py-2 text-gray-300">28-30</td><td className="px-3 py-2 text-gray-300">32</td></tr>
                <tr className="border-b border-gray-800"><td className="px-3 py-2 text-white">M</td><td className="px-3 py-2 text-gray-300">38-40</td><td className="px-3 py-2 text-gray-300">32-34</td><td className="px-3 py-2 text-gray-300">33</td></tr>
                <tr className="border-b border-gray-800"><td className="px-3 py-2 text-white">L</td><td className="px-3 py-2 text-gray-300">42-44</td><td className="px-3 py-2 text-gray-300">36-38</td><td className="px-3 py-2 text-gray-300">34</td></tr>
                <tr className="border-b border-gray-800"><td className="px-3 py-2 text-white">XL</td><td className="px-3 py-2 text-gray-300">46-48</td><td className="px-3 py-2 text-gray-300">40-42</td><td className="px-3 py-2 text-gray-300">35</td></tr>
                <tr><td className="px-3 py-2 text-white">XXL</td><td className="px-3 py-2 text-gray-300">50-52</td><td className="px-3 py-2 text-gray-300">44-46</td><td className="px-3 py-2 text-gray-300">36</td></tr>
              </tbody>
            </table>
          </div>

          {/* Dynamic product specs (if passed) */}
          {Object.keys(productSpecs).length > 0 && (
            <div className="border-t border-gray-700 pt-4 mt-2">
              <h4 className="text-white font-medium mb-2">Product Specifications</h4>
              <dl className="grid grid-cols-2 gap-1 text-sm">
                {Object.entries(productSpecs).map(([key, value]) => (
                  <div key={key} className="flex col-span-2 justify-between border-b border-gray-800 py-1">
                    <span className="text-gray-400">{key}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full mt-6 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}