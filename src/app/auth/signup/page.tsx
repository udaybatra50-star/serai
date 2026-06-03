'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') as 'brand' | 'retailer' | null

  const [role, setRole] = useState<'brand' | 'retailer'>(defaultRole || 'retailer')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            role,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Insert profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: form.email,
          full_name: form.fullName,
          phone: form.phone,
          role,
        })

        router.push(`/onboarding/${role}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex">
      {/* Left panel — editorial */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#16120f] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #5c2040 0%, transparent 60%)' }}
        />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-7 h-7 bg-[#5c2040] flex items-center justify-center">
            <span className="text-white text-xs" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>B</span>
          </div>
          <span className="text-white text-lg tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Serai</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-light text-white mb-6" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em', lineHeight: '1.15' }}>
            {role === 'brand'
              ? 'Your brand deserves a premium wholesale channel.'
              : 'Discover the finest Indian beauty brands.'}
          </h2>
          <p className="text-white/50 text-base leading-relaxed" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
            {role === 'brand'
              ? 'Join 200+ beauty and wellness brands already growing their wholesale business on Serai.'
              : 'Join 1,500+ boutique retailers sourcing premium Indian brands with Net-30 payment terms.'}
          </p>

          <div className="mt-12 space-y-4">
            {(role === 'brand'
              ? ['Set your own wholesale prices', 'Get paid within 7 days', 'Reach verified boutique retailers', 'Track orders in real time']
              : ['Browse 200+ curated brands', 'Net-30 payment terms', 'Verified brand authenticity', 'Order from multiple brands at once']
            ).map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#b87090] rounded-full shrink-0" />
                <span className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs font-sans tracking-wide relative z-10">
          © 2025 Serai Technologies Pvt. Ltd.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-[#5c2040] flex items-center justify-center">
              <span className="text-white text-xs" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>B</span>
            </div>
            <span className="text-[#16120f] text-lg tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Serai</span>
          </Link>

          <p className="section-label mb-3">Create account</p>
          <h1 className="text-3xl font-light text-[#16120f] mb-8" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em' }}>
            Join Serai
          </h1>

          {/* Role toggle */}
          <div className="flex mb-8 border border-[#e4dbd0] bg-white">
            <button
              type="button"
              onClick={() => setRole('retailer')}
              className={`flex-1 py-3 text-xs tracking-[0.12em] uppercase font-sans transition-all duration-200 ${
                role === 'retailer'
                  ? 'bg-[#5c2040] text-white'
                  : 'text-[#6e6560] hover:text-[#16120f]'
              }`}
            >
              I&apos;m a Retailer
            </button>
            <button
              type="button"
              onClick={() => setRole('brand')}
              className={`flex-1 py-3 text-xs tracking-[0.12em] uppercase font-sans transition-all duration-200 ${
                role === 'brand'
                  ? 'bg-[#5c2040] text-white'
                  : 'text-[#6e6560] hover:text-[#16120f]'
              }`}
            >
              I&apos;m a Brand
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">
                {role === 'brand' ? 'Your name' : 'Your name'}
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm text-[#16120f] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#5c2040] focus:border-[#5c2040] transition-all"
                placeholder="Full name"
              />
            </div>

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
              <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm text-[#16120f] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#5c2040] focus:border-[#5c2040] transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-[#e4dbd0] bg-white text-sm text-[#16120f] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#5c2040] focus:border-[#5c2040] transition-all"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6560] hover:text-[#16120f]"
                >
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
                <>Create account <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6e6560] font-sans">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#5c2040] hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#5c2040] hover:underline">Privacy Policy</Link>.
          </p>

          <div className="mt-6 text-center">
            <span className="text-xs text-[#6e6560] font-sans">Already have an account? </span>
            <Link href="/auth/signin" className="text-xs text-[#5c2040] hover:underline font-sans">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#5c2040] border-t-transparent rounded-full animate-spin" /></div>}>
      <SignUpContent />
    </Suspense>
  )
}
