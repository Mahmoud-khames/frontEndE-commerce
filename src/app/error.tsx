'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl mb-8">
        <nav className="text-[14px] text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span> 
          <span>Error</span>    
        </nav>
      </div>

      <div className="text-center">
        <h1 className="text-[72px] md:text-[120px] font-bold text-[#000000] leading-tight">
          Something went wrong!
        </h1>
        <p className="text-[16px] md:text-[18px] text-gray-600 mt-4">
          An unexpected error has occurred.
        </p>
        <button 
          onClick={() => reset()} 
          className="mt-8 bg-[#DB4444] text-white px-8 py-3 rounded text-[16px] font-medium hover:bg-[#c13535] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}