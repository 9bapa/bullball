'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection'
import { ThemePanel } from '@/components/theme/ThemePanel'
import { ImageModal } from '@/components/product/ImageModal'
import { Separator } from '@/components/ui/separator'
import { Palette } from 'lucide-react'
import { ProductCardProps } from '@/components/product/ProductCard'

export type ProductFilter = number

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<ProductFilter>(0)
  const [selectedProduct, setSelectedProduct] = useState<ProductCardProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Hero banner with image slider */}
        {/* <div className="relative bg-[#000] text-[#fff]">
          <div className="relative w-full h-[200px] md:h-[400px] lg:h-[500px] overflow-hidden">
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img
                src={currentSlide === 0 ? '/slide1.png' : '/slide2.png'}
                alt={`Hero slide ${currentSlide + 1}`}
                className="w-full h-full object-cover object-center scale-100 md:scale-110"
              />
            </div>
          </div>
          
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <button
              onClick={() => setCurrentSlide(0)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === 0 ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label="Go to slide 1"
            />
            <button
              onClick={() => setCurrentSlide(1)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === 1 ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label="Go to slide 2"
            />
          </div>
        </div> */}
        {/* Featured Products */}
        <section>
          <FeaturedProductsSection
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            isLoading={false}
          />
        </section>

        <Separator className="my-0" />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav />

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct || {
          id: '',
          name: '',
          base_price: 0,
          image_url: '',
          isNew: false,
          isSale: false,
          salePrice: 0
        }}
      />
    </div>
  )
}
