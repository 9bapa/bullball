'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CartRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/merch/cart')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to cart...</p>
      </div>
    </div>
  )
}