'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'

type Slide = {
  id: string
  image_url: string
  link_url?: string
  display_order: number
  width: number | null
  height: number | null
}

export default function Slideshow({ slides }: { slides: Slide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [
      Autoplay({
        delay: 10000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      })
    ]
  )
  const [containerHeight, setContainerHeight] = useState<number>(400)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const updateHeight = useCallback(() => {
    if (!emblaApi || !containerRef.current) return
    const index = emblaApi.selectedScrollSnap()
    const slide = slides[index]
    if (slide && slide.width && slide.height) {
      const containerWidth = containerRef.current.clientWidth
      const aspectRatio = slide.width / slide.height
      const calculatedHeight = containerWidth / aspectRatio
      setContainerHeight(calculatedHeight)
    }
  }, [emblaApi, slides])

  useEffect(() => {
    if (!emblaApi) return
    setTimeout(() => {
      updateHeight()
      setIsReady(true)
    }, 100)
    emblaApi.on('select', updateHeight)
    window.addEventListener('resize', updateHeight)
    return () => {
      emblaApi.off('select', updateHeight)
      window.removeEventListener('resize', updateHeight)
    }
  }, [emblaApi, updateHeight])

  if (!slides || slides.length === 0) {
    return <div className="h-64 bg-gray-900 flex items-center justify-center text-gray-500">No slides available</div>
  }

  return (
    <div className="w-full overflow-hidden bg-black">
      {/* ✅ ADDED: max-w-6xl + mx-auto on desktop to prevent pixelation */}
      <div className="max-w-6xl mx-auto px-0 md:px-4">
        <div
          ref={containerRef}
          className="relative w-full transition-[height] duration-500 ease-in-out"
          style={{ height: isReady ? containerHeight : 'auto' }}
        >
          <div className="overflow-hidden h-full rounded-none md:rounded-lg" ref={emblaRef}>
            <div className="flex h-full">
              {slides.map((slide) => (
                <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                  {slide.link_url ? (
                    <a href={slide.link_url} className="block w-full h-full">
                      <Image
                        src={slide.image_url}
                        alt="Slide"
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 768px) 100vw, 90vw"
                        quality={90}
                      />
                    </a>
                  ) : (
                    <Image
                      src={slide.image_url}
                      alt="Slide"
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 768px) 100vw, 90vw"
                      quality={90}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}