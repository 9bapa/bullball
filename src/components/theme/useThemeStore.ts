'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ColorPreset } from './colorPresets'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

interface ThemeStore {
  customColors: ThemeColors
  currentPreset: string | null
  setCustomColors: (colors: Partial<ThemeColors>) => void
  setPreset: (preset: ColorPreset) => void
  resetColors: () => void
}

const DEFAULT_COLORS: ThemeColors = {
  primary: '#669933', // Deep green (earthy finance)
  secondary: '#CC9933', // Muted gold
  accent: '#996633', // Clay / sand
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      customColors: DEFAULT_COLORS,
      currentPreset: 'default',
      setCustomColors: (colors) =>
        set((state) => ({
          customColors: { ...state.customColors, ...colors },
          currentPreset: null, // Clear preset when manually editing
        })),
      setPreset: (preset) =>
        set((state) => ({
          customColors: { ...preset.colors },
          currentPreset: preset.id,
        })),
      resetColors: () => set({ customColors: DEFAULT_COLORS, currentPreset: 'default' }),
    }),
    {
      name: 'bullrhun-theme-storage',
    }
  )
)
