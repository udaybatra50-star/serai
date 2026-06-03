import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#f2ede6] text-[#7a706b]',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    outline: 'border border-[#e8e0d8] text-[#7a706b]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[0.65rem] font-medium tracking-[0.1em] uppercase font-sans',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
