'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-[#6b2d4e] text-white hover:bg-[#521f3c] focus:ring-[#6b2d4e]',
      secondary:
        'bg-[#f2ede6] text-[#1a1614] hover:bg-[#e8e0d8] focus:ring-[#6b2d4e]',
      ghost:
        'text-[#7a706b] hover:text-[#1a1614] hover:bg-[#f2ede6] focus:ring-[#6b2d4e]',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
      outline:
        'border border-[#1a1614] text-[#1a1614] hover:bg-[#1a1614] hover:text-white focus:ring-[#1a1614]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-7 py-3 text-sm',
      lg: 'px-10 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
