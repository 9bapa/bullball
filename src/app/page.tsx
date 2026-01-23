'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection'
import { ThemePanel } from '@/components/theme/ThemePanel'
import { ImageModal } from '@/components/product/ImageModal'
import { Separator } from '@/components/ui/separator'
import { Palette } from 'lucide-react'
import { ProductCardProps } from '@/components/product/ProductCard'

export type ProductFilter = 'all' | 'bullrun' | 'btc' | 'eth' | 'bnb' | 'solana' | 'sui'

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<ProductFilter>('all')
  const [selectedProduct, setSelectedProduct] = useState<ProductCardProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = (product: ProductCardProps) => {
    setSelectedProduct(product)
    // setIsModalOpen(false)
  }

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
        {/* Featured Products */}
        <section>
          <FeaturedProductsSection
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            onImageClick={handleImageClick}
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
          image: '',
          isNew: false,
          isSale: false,
          salePrice: 0
        }}
      />
    </div>
  )
}
