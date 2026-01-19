'use client'

import { useState } from 'react'

interface ProductImageCarouselProps {
  images?: string[]
}

export default function ProductImageCarousel({ images = [] }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Default placeholder images - can be replaced with actual product photos
  const defaultImages = images.length > 0 
    ? images 
    : [
        '/placeholder-desk-1.jpg',
        '/placeholder-desk-2.jpg',
        '/placeholder-desk-3.jpg',
      ]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? defaultImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === defaultImages.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="w-full max-w-5xl mx-auto mb-16">
      <div className="relative ghibli-card overflow-hidden ghibli-shadow-lg">
        {/* Carousel Container */}
        <div className="relative h-[400px] md:h-[500px] w-full">
          {/* Images */}
          <div className="relative h-full w-full">
            {defaultImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative w-full h-full bg-base-200 flex items-center justify-center">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {defaultImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle bg-soft-cream/90 hover:bg-soft-cream border-warm-honey/30 text-deep-charcoal shadow-lg backdrop-blur-sm z-10"
                aria-label="Previous image"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle bg-soft-cream/90 hover:bg-soft-cream border-warm-honey/30 text-deep-charcoal shadow-lg backdrop-blur-sm z-10"
                aria-label="Next image"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {defaultImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {defaultImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-warm-honey w-8'
                      : 'bg-warm-honey/40 hover:bg-warm-honey/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
