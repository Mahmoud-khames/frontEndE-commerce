'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  ...props
}: {
  src: string
  alt: string
  fallbackSrc?: string
  [key: string]: any
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse w-full h-full bg-gray-200"></div>
        </div>
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onError={() => setImgSrc(fallbackSrc)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}