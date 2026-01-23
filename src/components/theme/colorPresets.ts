export interface ColorPreset {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  category: 'default' | 'nature' | 'modern' | 'crypto' | 'vibrant' | 'minimal' | 'retro'
}

export const colorPresets: ColorPreset[] = [
  // Default (Original)
  {
    id: 'default',
    name: 'BullRun',
    description: 'Classic earthy finance tones',
    category: 'default',
    colors: {
      primary: '#669933',
      secondary: '#CC9933',
      accent: '#996633',
    },
  },

  // Nature Presets
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep greens and natural tones',
    category: 'nature',
    colors: {
      primary: '#2D5A27',
      secondary: '#8B7355',
      accent: '#4A7C59',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blues and teal',
    category: 'nature',
    colors: {
      primary: '#2D6A9F',
      secondary: '#6B9AC4',
      accent: '#4D8AB7',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and purples',
    category: 'nature',
    colors: {
      primary: '#C8553D',
      secondary: '#E07A5F',
      accent: '#D97757',
    },
  },

  // Modern Presets
  {
    id: 'slate',
    name: 'Slate Modern',
    description: 'Professional grays and blues',
    category: 'modern',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#8B5CF6',
    },
  },
  {
    id: 'electric',
    name: 'Electric',
    description: 'High-energy purple and cyan',
    category: 'modern',
    colors: {
      primary: '#7C3AED',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark theme inspired',
    category: 'modern',
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#818CF8',
    },
  },

  // Crypto Presets
  {
    id: 'bitcoin',
    name: 'Bitcoin Gold',
    description: 'Classic crypto wealth',
    category: 'crypto',
    colors: {
      primary: '#F7931A',
      secondary: '#FFC800',
      accent: '#E07A3D',
    },
  },
  {
    id: 'ethereum',
    name: 'Ethereum Blue',
    description: 'Smart contract elegance',
    category: 'crypto',
    colors: {
      primary: '#627EEA',
      secondary: '#00C3FF',
      accent: '#4C82FB',
    },
  },
  {
    id: 'defi',
    name: 'DeFi Green',
    description: 'Decentralized finance',
    category: 'crypto',
    colors: {
      primary: '#00D395',
      secondary: '#00FFB8',
      accent: '#0BC5EA',
    },
  },
  {
    id: 'memecoin',
    name: 'Meme Coin',
    description: 'Playful and bold',
    category: 'crypto',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFD93D',
      accent: '#FF8E53',
    },
  },

  // Vibrant Presets
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Lively island vibes',
    category: 'vibrant',
    colors: {
      primary: '#FF6B9D',
      secondary: '#FFA500',
      accent: '#00CED1',
    },
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Sweet pastel tones',
    category: 'vibrant',
    colors: {
      primary: '#FF9AA2',
      secondary: '#FFB7B2',
      accent: '#FFDAC1',
    },
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Cyberpunk glow',
    category: 'vibrant',
    colors: {
      primary: '#00FF87',
      secondary: '#FF0055',
      accent: '#60EFFF',
    },
  },

  // Minimal Presets
  {
    id: 'mono',
    name: 'Monochrome',
    description: 'Black and white elegance',
    category: 'minimal',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#808080',
    },
  },
  {
    id: 'cream',
    name: 'Cream',
    description: 'Soft warm neutrals',
    category: 'minimal',
    colors: {
      primary: '#8B7E66',
      secondary: '#D4C5A9',
      accent: '#E8DFCA',
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    description: 'Subtle pink tones',
    category: 'minimal',
    colors: {
      primary: '#C68E7D',
      secondary: '#EAC4D5',
      accent: '#B5838D',
    },
  },

  // Retro Presets
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: '80s synthwave aesthetic',
    category: 'retro',
    colors: {
      primary: '#FF71CE',
      secondary: '#01CDFE',
      accent: '#B967FF',
    },
  },
  {
    id: 'arcade',
    name: 'Arcade',
    description: 'Retro gaming vibes',
    category: 'retro',
    colors: {
      primary: '#E63946',
      secondary: '#F1FAEE',
      accent: '#A8DADC',
    },
  },
  {
    id: 'gameboy',
    name: 'GameBoy',
    description: 'Nostalgic handheld',
    category: 'retro',
    colors: {
      primary: '#0F380F',
      secondary: '#306230',
      accent: '#8BAC0F',
    },
  },
]

export const presetCategories = [
  { id: 'default', name: 'Default', icon: '🎯' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'modern', name: 'Modern', icon: '✨' },
  { id: 'crypto', name: 'Crypto', icon: '💎' },
  { id: 'vibrant', name: 'Vibrant', icon: '🌈' },
  { id: 'minimal', name: 'Minimal', icon: '⚪' },
  { id: 'retro', name: 'Retro', icon: '🕹️' },
] as const
