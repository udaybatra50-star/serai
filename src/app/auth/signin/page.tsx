'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) throw signInError

      // Get user role and redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'brand') router.push('/brand/dashboard')
      else if (profile?.role === 'retailer') router.push('/retailer/dashboard')
      else if (profile?.role === 'admin') router.push('/admin')
      else router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5c2040] flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #b87090 0%, transparent 60%)' }} />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-7 h-7 bg-white flex items-center justify-center">
            <span className="text-[#5c2040] text-xs" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>B</span>
          </div>
          <span className="text-white text-lg tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Serai</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-light text-white mb-6" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em', lineHeight: '1.15' }}>
            Welcome back to the marketplace.
          </h2>
          <p className="text-white/60 text-base leading-relaxed" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
            Your brands, your orders, your business — all in one premium wholesale platform.
          </p>
        </div>
        <p className="text-white/20 text-xs font-sans tracking-wide relative z-10">© 2025 Serai Technologies Pvt. Ltd.</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-[#5c2040] flex items-center justify-center">
              <span className="text-white text-xs" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>B</span>
            </div>
            <span className="text-[#16120f] text-lg tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Serai</span>
          </Link>

          <p className="section-label mb-3">Welcome back</p>
          <h1 className="text-3xl font-light text-[#16120f] mb-10" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em' }}>
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm text-[#16120f] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#5c2040] focus:border-[#5c2040] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] font-sans">Password</label>
                <Link href="/auth/reset-password" className="text-xs text-[#5c2040] hover:underline font-sans">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-[#e4dbd0] bg-white text-sm text-[#16120f] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#5c2040] focus:border-[#5c2040] transition-all"
                  placeholder="Your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6560]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-xs text-red-700 font-sans">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5c2040] text-white py-4 text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#461832] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-xs text-[#6e6560] font-sans">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-xs text-[#5c2040] hover:underline font-sans">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
