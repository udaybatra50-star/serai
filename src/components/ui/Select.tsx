'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-3 border border-[#e8e0d8] bg-white appearance-none',
            'text-sm text-[#1a1614]',
            'focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] focus:border-[#6b2d4e]',
            'transition-all duration-200 cursor-pointer',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-sans">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
