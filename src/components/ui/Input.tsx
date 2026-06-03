'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border border-[#e8e0d8] bg-white',
            'text-sm text-[#1a1614] placeholder:text-[#b8b0a8]',
            'focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] focus:border-[#6b2d4e]',
            'transition-all duration-200',
            error && 'border-red-400 focus:ring-red-400 focus:border-red-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-sans">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#7a706b] font-sans">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
