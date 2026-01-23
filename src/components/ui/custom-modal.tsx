'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Info, AlertTriangle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalVariant {
  icon: any
  gradient: string
  iconBg: string
  titleColor: string
}

const modalVariants: Record<string, ModalVariant> = {
  success: {
    icon: CheckCircle2,
    gradient: 'from-emerald-400 via-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500/20',
    titleColor: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: XCircle,
    gradient: 'from-red-400 via-red-500 to-rose-500',
    iconBg: 'bg-red-500/20',
    titleColor: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    gradient: 'from-blue-400 via-blue-500 to-indigo-500',
    iconBg: 'bg-blue-500/20',
    titleColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-400 via-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/20',
    titleColor: 'text-amber-600 dark:text-amber-400',
  },
  magic: {
    icon: Sparkles,
    gradient: 'from-purple-400 via-purple-500 to-pink-500',
    iconBg: 'bg-purple-500/20',
    titleColor: 'text-purple-600 dark:text-purple-400',
  },
}

interface CustomModalProps {
  variant: 'success' | 'error' | 'info' | 'warning' | 'magic'
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function CustomModal({
  variant,
  title,
  description,
  primaryAction,
  secondaryAction,
}: CustomModalProps) {
  const [open, setOpen] = useState(false)
  const config = modalVariants[variant]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'relative overflow-hidden group transition-all duration-300',
            'hover:scale-105 hover:shadow-2xl',
            'border-2'
          )}
        >
          <div
            className={cn(
              'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
              'bg-gradient-to-br',
              config.gradient
            )}
          />
          <span className="relative z-10 font-mono text-sm">
            {variant}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          'border-0 shadow-2xl',
          'backdrop-blur-xl bg-background/95',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4'
        )}
      >
        {/* Animated Background */}
        <div
          className={cn(
            'absolute inset-0 -z-10 opacity-30',
            'bg-gradient-to-br',
            config.gradient
          )}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${config.gradient.split(' ')[0]}, transparent 50%), radial-gradient(circle at 80% 70%, ${config.gradient.split(' ')[2]}, transparent 50%)`,
          }}
        />

        {/* Decorative Elements */}
        <div
          className={cn(
            'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-40',
            config.gradient
          )}
        />
        <div
          className={cn(
            'absolute -bottom-20 -left-20 w-32 h-32 rounded-full blur-3xl opacity-40',
            config.gradient
          )}
        />

        <DialogHeader className="text-center pb-6">
          {/* Icon Container */}
          <div
            className={cn(
              'relative w-20 h-20 mx-auto mb-4 rounded-3xl',
              'flex items-center justify-center',
              'shadow-2xl transform group-hover:scale-110 transition-transform duration-500',
              'animate-bounce-slight',
              'border-2',
              config.iconBg,
              'from-white/80 to-white/50 backdrop-blur-md'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 rounded-3xl opacity-0',
                'bg-gradient-to-br',
                config.gradient
              )}
              style={{
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            />
            <Icon className={cn('h-10 w-10 relative z-10', config.titleColor)} />
          </div>

          <DialogTitle
            className={cn(
              'font-display font-bold text-3xl mb-3',
              config.titleColor
            )}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 pt-6">
          {primaryAction && (
            <Button
              onClick={() => {
                primaryAction.onClick()
                setOpen(false)
              }}
              className={cn(
                'h-12 text-base font-semibold shadow-lg',
                'hover:shadow-xl hover:scale-105',
                'transition-all duration-300',
                'bg-gradient-to-r',
                config.gradient
              )}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={() => {
                secondaryAction.onClick()
                setOpen(false)
              }}
              className="h-12 text-base font-semibold"
            >
              {secondaryAction.label}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
