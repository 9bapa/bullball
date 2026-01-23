'use client'

import { X, Info, AlertTriangle, CheckCircle2, Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InfoNoticeProps {
  variant: 'info' | 'success' | 'warning' | 'error' | 'magic'
  title: string
  message: string
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  className?: string
}

const noticeVariants = {
  info: {
    icon: Info,
    gradient: 'from-blue-400/20 via-blue-500/20 to-indigo-500/20',
    borderGradient: 'from-blue-400 to-indigo-500',
    iconBg: 'bg-blue-500',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700 dark:text-blue-300',
  },
  success: {
    icon: CheckCircle2,
    gradient: 'from-emerald-400/20 via-emerald-500/20 to-teal-500/20',
    borderGradient: 'from-emerald-400 to-teal-500',
    iconBg: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-400/20 via-amber-500/20 to-orange-500/20',
    borderGradient: 'from-amber-400 to-orange-500',
    iconBg: 'bg-amber-500',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700 dark:text-amber-300',
  },
  error: {
    icon: Zap,
    gradient: 'from-red-400/20 via-red-500/20 to-rose-500/20',
    borderGradient: 'from-red-400 to-rose-500',
    iconBg: 'bg-red-500',
    iconColor: 'text-red-500',
    titleColor: 'text-red-700 dark:text-red-300',
  },
  magic: {
    icon: Sparkles,
    gradient: 'from-purple-400/20 via-purple-500/20 to-pink-500/20',
    borderGradient: 'from-purple-400 to-pink-500',
    iconBg: 'bg-purple-500',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-700 dark:text-purple-300',
  },
}

export function InfoNotice({
  variant,
  title,
  message,
  onClose,
  action,
  dismissible = true,
  className,
}: InfoNoticeProps) {
  const config = noticeVariants[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'group/notion',
        'transition-all duration-500',
        'animate-in slide-in-from-top-4 fade-in-0 duration-500',
        'backdrop-blur-md',
        'bg-gradient-to-br',
        config.gradient,
        'border-2 border-transparent',
        'hover:shadow-2xl hover:scale-[1.01]',
        className
      )}
      style={{
        background: `
          linear-gradient(135deg,
            ${config.gradient.split(' ')[0]} 0%,
            ${config.gradient.split(' ')[2]} 100%
          )
        `,
        borderImage: `linear-gradient(135deg, ${config.borderGradient.split(' ')[0]}, ${config.borderGradient.split(' ')[1]}) 1`,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, ${config.iconBg} 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${config.iconBg} 0%, transparent 50%)
            `,
            backgroundSize: '100% 100%',
            animation: 'gradient-shift 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Decorative Glow */}
      <div
        className={cn(
          'absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl',
          'opacity-30 animate-pulse-slow',
          config.iconBg
        )}
      />

      {/* Main Content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-2xl',
            'flex items-center justify-center',
            'shadow-lg transform group-hover/notion:scale-110 group-hover/notion:rotate-6',
            'transition-all duration-300',
            'border-2 border-white/30',
            'from-white/80 to-white/50 backdrop-blur-md',
            config.iconBg
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-display font-bold text-lg mb-2',
              'group-hover/notion:translate-x-1 transition-transform',
              config.titleColor
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {message}
          </p>

          {action && (
            <Button
              onClick={action.onClick}
              className={cn(
                'mt-4 h-10 text-sm font-semibold',
                'hover:scale-105 transition-transform',
                'bg-gradient-to-r',
                config.borderGradient,
                'shadow-md hover:shadow-lg'
              )}
            >
              {action.label}
            </Button>
          )}
        </div>

        {/* Close Button */}
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 p-2 rounded-xl',
              'hover:bg-white/20 transition-all',
              'group-hover/notion:rotate-90',
              'transition-transform duration-300'
            )}
          >
            <X className="h-4 w-4 text-foreground/60 group-hover/notion:text-foreground transition-colors" />
          </button>
        )}
      </div>

      {/* Animated Border */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl border-2 pointer-events-none',
          'opacity-0 group-hover/notion:opacity-100',
          'transition-opacity duration-500',
          'bg-gradient-to-r',
          config.borderGradient
        )}
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
        }}
      />
    </div>
  )
}
