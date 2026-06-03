'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 border border-[#e8e0d8] bg-white resize-none',
            'text-sm text-[#1a1614] placeholder:text-[#b8b0a8]',
            'focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] focus:border-[#6b2d4e]',
            'transition-all duration-200',
            error && 'border-red-400',
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

Textarea.displayName = 'Textarea'

export default Textarea
