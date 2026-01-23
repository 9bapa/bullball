'use client'

import { useState } from 'react'
import { RotateCcw, Droplet, Palette, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useThemeStore } from './useThemeStore'
import { useApplyThemeColors } from './useApplyThemeColors'
import { colorPresets, presetCategories, ColorPreset } from './colorPresets'
import { cn } from '@/lib/utils'

export function ThemePanel() {
  const { customColors, setCustomColors, resetColors, setPreset, currentPreset } = useThemeStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  // Apply theme colors on component mount and updates
  useApplyThemeColors()

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    // Validate hex format and ensure divisible by 3
    const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/
    if (hexRegex.test(value)) {
      setCustomColors({ [colorType]: value })
      applyColor(`custom-${colorType}`, value)
    }
  }

  const handlePresetSelect = (preset: ColorPreset) => {
    setPreset(preset)
    applyColor('custom-primary', preset.colors.primary)
    applyColor('custom-secondary', preset.colors.secondary)
    applyColor('custom-accent', preset.colors.accent)
  }

  // Apply colors to CSS variables for immediate feedback
  const applyColor = (colorType: string, color: string) => {
    const root = document.documentElement
    const cssVar = `--${colorType}`
    root.style.setProperty(cssVar, color)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  const handleReset = () => {
    resetColors()
    applyColor('custom-primary', '#669933')
    applyColor('custom-secondary', '#CC9933')
    applyColor('custom-accent', '#996633')
    setSelectedCategory(null)
    setShowCustom(false)
  }

  return (
    <Card className="border-2 shadow-sm bg-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm">THEME PRESETS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Categories */}
        <div className="space-y-4">
          <Label className="text-xs font-mono font-semibold uppercase tracking-wider">
            Color Schemes
          </Label>

          {/* Category Accordion */}
          <div className="space-y-2">
            {presetCategories.map((category) => {
              const categoryPresets = colorPresets.filter(p => p.category === category.id)
              const isOpen = selectedCategory === category.id

              return (
                <div key={category.id} className="border border-border/50 rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-12 px-4 hover:bg-muted/50"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {isOpen && (
                    <div className="border-t border-border/30 p-3 space-y-2 bg-muted/20">
                      {categoryPresets.map((preset) => {
                        const isSelected = currentPreset === preset.id
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset)}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                              'hover:shadow-md hover:scale-[1.02]',
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/30'
                                : 'border-border/50 bg-background hover:bg-muted/30'
                            )}
                          >
                            {/* Color Preview */}
                            <div className="flex gap-1 shrink-0">
                              <div
                                className="w-8 h-8 rounded-md shadow-sm"
                                style={{ backgroundColor: preset.colors.primary }}
                              />
                              <div
                                className="w-8 h-8 rounded-md shadow-sm"
                                style={{ backgroundColor: preset.colors.secondary }}
                              />
                              <div
                                className="w-8 h-8 rounded-md shadow-sm"
                                style={{ backgroundColor: preset.colors.accent }}
                              />
                            </div>

                            {/* Preset Info */}
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm text-foreground">
                                {preset.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {preset.description}
                              </p>
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Custom Color Section */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowCustom(!showCustom)}
          >
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span className="font-mono text-sm font-semibold uppercase">
                Custom Colors
              </span>
            </div>
            {showCustom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showCustom && (
            <div className="space-y-4 pt-2">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-xs font-mono font-semibold uppercase tracking-wider">
                  Primary
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => {
                      handleColorChange('primary', e.target.value)
                      applyColor('custom-primary', e.target.value)
                    }}
                    className="h-9 w-14 p-0.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    type="text"
                    value={customColors.primary}
                    onChange={(e) => {
                      handleColorChange('primary', e.target.value)
                      applyColor('custom-primary', e.target.value)
                    }}
                    placeholder="#669933"
                    className="flex-1 font-mono text-xs uppercase h-9"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondary-color" className="text-xs font-mono font-semibold uppercase tracking-wider">
                  Secondary
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => {
                      handleColorChange('secondary', e.target.value)
                      applyColor('custom-secondary', e.target.value)
                    }}
                    className="h-9 w-14 p-0.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    type="text"
                    value={customColors.secondary}
                    onChange={(e) => {
                      handleColorChange('secondary', e.target.value)
                      applyColor('custom-secondary', e.target.value)
                    }}
                    placeholder="#CC9933"
                    className="flex-1 font-mono text-xs uppercase h-9"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <Label htmlFor="accent-color" className="text-xs font-mono font-semibold uppercase tracking-wider">
                  Accent
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => {
                      handleColorChange('accent', e.target.value)
                      applyColor('custom-accent', e.target.value)
                    }}
                    className="h-9 w-14 p-0.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    type="text"
                    value={customColors.accent}
                    onChange={(e) => {
                      handleColorChange('accent', e.target.value)
                      applyColor('custom-accent', e.target.value)
                    }}
                    placeholder="#996633"
                    className="flex-1 font-mono text-xs uppercase h-9"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full font-mono text-xs h-9 border-2"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          RESET TO DEFAULT
        </Button>

        {/* Color Preview */}
        <div className="space-y-2 pt-3 border-t border-border/50">
          <Label className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Active Colors
          </Label>
          <div className="flex gap-1.5">
            <div
              className="flex-1 h-12 rounded-lg shadow-sm border border-border/30 transition-all hover:scale-105"
              style={{ backgroundColor: customColors.primary }}
              title="Primary"
            />
            <div
              className="flex-1 h-12 rounded-lg shadow-sm border border-border/30 transition-all hover:scale-105"
              style={{ backgroundColor: customColors.secondary }}
              title="Secondary"
            />
            <div
              className="flex-1 h-12 rounded-lg shadow-sm border border-border/30 transition-all hover:scale-105"
              style={{ backgroundColor: customColors.accent }}
              title="Accent"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
