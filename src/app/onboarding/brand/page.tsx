'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'

const STEPS = ['Brand details', 'Products & pricing', 'Payment info', 'Review & launch']

const CATEGORIES = ['Beauty', 'Wellness']
const SUBCATEGORIES: Record<string, string[]> = {
  Beauty: ['Skincare', 'Makeup', 'Hair Care', 'Body Care', 'Fragrances', 'Tools & Devices'],
  Wellness: ['Supplements', 'Aromatherapy', 'Ayurveda', 'Yoga & Fitness', 'Sleep & Relaxation'],
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Goa', 'Gujarat', 'Karnataka', 'Kerala',
  'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal', 'Other'
]

export default function BrandOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    website_url: '',
    instagram_handle: '',
    founded_year: '',
    origin_city: '',
    origin_state: '',
    categories: [] as string[],
    subcategories: [] as string[],
    minimum_order_value: '5000',
    gst_number: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_name: '',
  })

  const updateField = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }))
  }

  const toggleSubcategory = (sub: string) => {
    setForm((f) => ({
      ...f,
      subcategories: f.subcategories.includes(sub)
        ? f.subcategories.filter((s) => s !== sub)
        : [...f.subcategories, sub],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get category IDs
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', form.categories)

      const { data: subcategoryData } = await supabase
        .from('subcategories')
        .select('id, name')
        .in('name', form.subcategories)

      // Create brand
      const { data: brand, error: brandError } = await supabase.from('brands').insert({
        user_id: user.id,
        name: form.name,
        slug: slugify(form.name) + '-' + Date.now().toString().slice(-4),
        tagline: form.tagline,
        description: form.description,
        website_url: form.website_url,
        instagram_handle: form.instagram_handle,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        origin_city: form.origin_city,
        origin_state: form.origin_state,
        minimum_order_value: parseFloat(form.minimum_order_value),
        gst_number: form.gst_number,
        bank_account_name: form.bank_account_name,
        bank_account_number: form.bank_account_number,
        bank_ifsc: form.bank_ifsc,
        bank_name: form.bank_name,
        status: 'pending',
      }).select().single()

      if (brandError) throw brandError

      // Link categories
      if (categoryData?.length) {
        await supabase.from('brand_categories').insert(
          categoryData.map((c) => ({ brand_id: brand.id, category_id: c.id }))
        )
      }

      // Link subcategories
      if (subcategoryData?.length) {
        await supabase.from('brand_subcategories').insert(
          subcategoryData.map((s) => ({ brand_id: brand.id, subcategory_id: s.id }))
        )
      }

      router.push('/brand/dashboard?welcome=true')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create brand profile')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.name && form.description
    if (step === 1) return form.categories.length > 0 && form.minimum_order_value
    if (step === 2) return form.gst_number && form.bank_account_number && form.bank_ifsc
    return true
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] py-12">
      <div className="container-editorial max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-[#5c2040] flex items-center justify-center">
            <span className="text-white text-xs" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>B</span>
          </div>
          <span className="text-[#16120f] text-lg tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Serai</span>
        </div>

        <p className="section-label mb-2">Brand Onboarding</p>
        <h1 className="text-3xl font-light text-[#16120f] mb-8" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em' }}>
          Set up your brand profile
        </h1>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-medium font-sans transition-all ${
                  i < step ? 'bg-[#5c2040] text-white' : i === step ? 'bg-[#16120f] text-white' : 'bg-[#e4dbd0] text-[#6e6560]'
                }`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-sans hidden sm:block ${i <= step ? 'text-[#16120f]' : 'text-[#6e6560]'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-[#5c2040]' : 'bg-[#e4dbd0]'}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white border border-[#e4dbd0] p-8">
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Tell us about your brand</h2>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Brand name *</label>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="e.g. Verdant Skin" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Tagline</label>
                <input value={form.tagline} onChange={(e) => updateField('tagline', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="One line that defines your brand" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Brand story *</label>
                <textarea rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="What makes your brand unique? What's your story?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Website</label>
                  <input value={form.website_url} onChange={(e) => updateField('website_url', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="https://yourbrand.com" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Instagram</label>
                  <input value={form.instagram_handle} onChange={(e) => updateField('instagram_handle', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="@yourbrand" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Founded year</label>
                  <input type="number" min="2000" max="2025" value={form.founded_year} onChange={(e) => updateField('founded_year', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="2020" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">City</label>
                  <input value={form.origin_city} onChange={(e) => updateField('origin_city', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="Mumbai" />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">State</label>
                <select value={form.origin_state} onChange={(e) => updateField('origin_state', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all appearance-none">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Categories & pricing</h2>
              <div>
                <p className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-4 font-sans">Select your categories *</p>
                <div className="flex gap-3 flex-wrap mb-6">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-5 py-2.5 text-sm border transition-all ${form.categories.includes(cat) ? 'bg-[#5c2040] text-white border-[#5c2040]' : 'border-[#e4dbd0] text-[#6e6560] hover:border-[#5c2040]'}`} style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                {form.categories.length > 0 && (
                  <div>
                    <p className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-3 font-sans">Subcategories</p>
                    <div className="flex gap-2 flex-wrap">
                      {form.categories.flatMap((cat) => SUBCATEGORIES[cat] || []).map((sub) => (
                        <button key={sub} type="button" onClick={() => toggleSubcategory(sub)} className={`px-4 py-2 text-xs border transition-all font-sans ${form.subcategories.includes(sub) ? 'bg-[#f5e8ef] text-[#5c2040] border-[#5c2040]' : 'border-[#e4dbd0] text-[#6e6560] hover:border-[#5c2040]'}`}>
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Minimum order value (₹) *</label>
                <input type="number" min="1000" value={form.minimum_order_value} onChange={(e) => updateField('minimum_order_value', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="5000" />
                <p className="mt-1.5 text-xs text-[#6e6560] font-sans">Retailers must meet this minimum value to place an order with your brand.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Payment & compliance</h2>
              <p className="text-sm text-[#6e6560]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>This information is used to process your payouts. It is stored securely and never shared.</p>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">GST Number *</label>
                <input value={form.gst_number} onChange={(e) => updateField('gst_number', e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all font-mono" placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div className="h-px bg-[#e4dbd0]" />
              <p className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] font-sans">Bank account for payouts</p>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Account holder name *</label>
                <input value={form.bank_account_name} onChange={(e) => updateField('bank_account_name', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="As per bank records" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Account number *</label>
                  <input value={form.bank_account_number} onChange={(e) => updateField('bank_account_number', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all font-mono" placeholder="Account number" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">IFSC code *</label>
                  <input value={form.bank_ifsc} onChange={(e) => updateField('bank_ifsc', e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all font-mono" placeholder="HDFC0001234" maxLength={11} />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Bank name</label>
                <input value={form.bank_name} onChange={(e) => updateField('bank_name', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="HDFC Bank" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Review your profile</h2>
              <div className="space-y-4">
                {[
                  { label: 'Brand name', value: form.name },
                  { label: 'Categories', value: form.categories.join(', ') },
                  { label: 'Minimum order', value: `₹${parseInt(form.minimum_order_value).toLocaleString('en-IN')}` },
                  { label: 'Location', value: `${form.origin_city}, ${form.origin_state}` },
                  { label: 'GST Number', value: form.gst_number },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3 border-b border-[#e4dbd0]">
                    <span className="text-xs text-[#6e6560] font-sans tracking-wide">{label}</span>
                    <span className="text-sm text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{value || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#f5e8ef] border border-[#d4a0b8] p-5">
                <p className="text-sm text-[#5c2040]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                  Your brand profile will be reviewed by our team within 24–48 hours. You will be notified by email once approved.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-xs text-red-700 font-sans">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm text-[#6e6560] font-sans tracking-wide hover:text-[#16120f] transition-colors disabled:opacity-0"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 bg-[#5c2040] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#461832] transition-colors disabled:opacity-40"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#5c2040] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#461832] transition-colors disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit for review'} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
