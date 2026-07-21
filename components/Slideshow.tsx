'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'

type Slide = {
  id: string
  image_url: string
  link_url?: string
  display_order: number
}

export default function Slideshow({ slides }: { slides: Slide[] }) {
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30, // smooth transition speed
    },
    [
      Autoplay({
        delay: 5000, // 10 seconds between slides
        stopOnInteraction: true, // pause when user interacts (click/drag)
        stopOnMouseEnter: true, // pause when mouse hovers over the slideshow
      })
    ]
  )

  if (!slides || slides.length === 0) {
    return <div className="h-64 bg-gray-900 flex items-center justify-center text-gray-500">No slides available</div>
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide) => (
          <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-64 sm:h-96 md:h-125">
            {slide.link_url ? (
              <a href={slide.link_url} className="block w-full h-full">
                <Image
                  src={slide.image_url}
                  alt="Slide"
                  fill
                  className="object-cover"
                  priority
                />
              </a>
            ) : (
              <Image
                src={slide.image_url}
                alt="Slide"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}