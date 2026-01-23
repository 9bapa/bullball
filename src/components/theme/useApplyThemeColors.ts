'use client'

import { useEffect } from 'react'
import { useThemeStore } from './useThemeStore'

/**
 * Hook that applies custom theme colors to CSS variables
 * This enables live theme switching across the entire app
 */
export function useApplyThemeColors() {
  const customColors = useThemeStore((state) => state.customColors)

  useEffect(() => {
    // Apply theme colors to root CSS variables for live theme switching
    const root = document.documentElement
    root.style.setProperty('--custom-primary', customColors.primary)
    root.style.setProperty('--custom-secondary', customColors.secondary)
    root.style.setProperty('--custom-accent', customColors.accent)
  }, [customColors.primary, customColors.secondary, customColors.accent])
}
