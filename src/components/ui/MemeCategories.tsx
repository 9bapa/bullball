'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  emoji: string
  count: number
  color: string
  gradient: string
}

interface MemeCategoriesProps {
  className?: string
}

export function MemeCategories({ className = '' }: MemeCategoriesProps) {
  const [categories] = useState<Category[]>([
    {
      id: 'dog-coins',
      name: 'Dog Coins',
      emoji: '🐕',
      count: 124,
      color: 'text-yellow-400',
      gradient: 'bg-gradient-orange'
    },
    {
      id: 'pepe-ecosystem',
      name: 'Pepe Ecosystem',
      emoji: '🐸',
      count: 89,
      color: 'text-green-400',
      gradient: 'bg-gradient-green'
    },
    {
      id: 'animal-memes',
      name: 'Animal Memes',
      emoji: '🦊',
      count: 156,
      color: 'text-purple-400',
      gradient: 'bg-gradient-purple'
    },
    {
      id: 'defi-memes',
      name: 'DeFi Memes',
      emoji: '💎',
      count: 67,
      color: 'text-blue-400',
      gradient: 'bg-gradient-blue'
    },
    {
      id: 'culture-memes',
      name: 'Culture Memes',
      emoji: '🎭',
      count: 93,
      color: 'text-pink-400',
      gradient: 'bg-gradient-pink'
    },
    {
      id: 'limited-edition',
      name: 'Limited Drops',
      emoji: '⚡',
      count: 23,
      color: 'text-orange-400',
      gradient: 'bg-gradient-rainbow'
    },
    {
      id: 'new-arrivals',
      name: 'New Arrivals',
      emoji: '🆕',
      count: 45,
      color: 'text-cyan-400',
      gradient: 'bg-gradient-blue'
    },
    {
      id: 'vintage-classics',
      name: 'Vintage Classics',
      emoji: '👑',
      count: 78,
      color: 'text-gray-400',
      gradient: 'bg-gradient-purple'
    }
  ])

  return (
    <div className={className}>
      <div className="grid grid-cols-2 grid-responsive gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="category-card group"
          >
            {/* Category Icon */}
            <div className={`
              text-6xl mb-4 transition-transform duration-300
              group-hover:scale-110
            `}>
              {category.emoji}
            </div>
            
            {/* Category Name */}
            <div className="text-white font-bold font-display text-lg mb-2">
              {category.name}
            </div>
            
            {/* Item Count */}
            <div className="text-gray-400 text-sm mb-3">
              {category.count} items
            </div>
            
            {/* Hover Effect */}
            <div className={`
              h-1 w-full rounded-full mt-3 transition-all duration-300
              ${category.gradient}
            `}></div>
          </Link>
        ))}
      </div>
    </div>
  )
}