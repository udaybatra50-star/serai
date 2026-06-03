'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'

const STEPS = ['Business details', 'Store type', 'Location', 'Review']

const STORE_TYPES = [
  { value: 'boutique', label: 'Fashion Boutique' },
  { value: 'spa', label: 'Spa / Wellness Centre' },
  { value: 'salon', label: 'Salon' },
  { value: 'pharmacy', label: 'Pharmacy / Medical' },
  { value: 'online', label: 'Online Store' },
  { value: 'department_store', label: 'Department Store' },
  { value: 'wellness_center', label: 'Wellness Centre' },
  { value: 'other', label: 'Other' },
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Goa', 'Gujarat', 'Karnataka', 'Kerala',
  'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal', 'Other'
]

export default function RetailerOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    business_name: '',
    description: '',
    website_url: '',
    instagram_handle: '',
    store_type: '',
    gst_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const updateField = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('retailers').insert({
        user_id: user.id,
        business_name: form.business_name,
        slug: slugify(form.business_name) + '-' + Date.now().toString().slice(-4),
        description: form.description,
        website_url: form.website_url,
        instagram_handle: form.instagram_handle,
        store_type: form.store_type,
        gst_number: form.gst_number,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        status: 'pending',
      })

      router.push('/retailer/dashboard?welcome=true')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create retailer profile')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.business_name
    if (step === 1) return form.store_type
    if (step === 2) return form.city && form.state && form.pincode
    return true
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] py-12">
      <div className="container-editorial max-w-2xl">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-[#5c2040] flex items-center justify-center">
            <span className="text-white text-xs" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>B</span>
          </div>
          <span className="text-[#16120f] text-lg tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Serai</span>
        </div>

        <p className="section-label mb-2">Retailer Onboarding</p>
        <h1 className="text-3xl font-light text-[#16120f] mb-8" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em' }}>
          Set up your retailer profile
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

        <div className="bg-white border border-[#e4dbd0] p-8">
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Business details</h2>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Business name *</label>
                <input value={form.business_name} onChange={(e) => updateField('business_name', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="The Beauty Edit" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">About your store</label>
                <textarea rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="Tell brands what makes your store special" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Website</label>
                  <input value={form.website_url} onChange={(e) => updateField('website_url', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="https://yourstore.com" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Instagram</label>
                  <input value={form.instagram_handle} onChange={(e) => updateField('instagram_handle', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="@yourstore" />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">GST Number</label>
                <input value={form.gst_number} onChange={(e) => updateField('gst_number', e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all font-mono" placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>What type of store are you?</h2>
              <p className="text-sm text-[#6e6560]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>This helps brands understand your retail context.</p>
              <div className="grid grid-cols-2 gap-3">
                {STORE_TYPES.map((type) => (
                  <button key={type.value} type="button" onClick={() => updateField('store_type', type.value)} className={`p-4 border text-left transition-all ${form.store_type === type.value ? 'border-[#5c2040] bg-[#f5e8ef]' : 'border-[#e4dbd0] hover:border-[#5c2040]'}`}>
                    <span className="text-sm text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Shipping address</h2>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Address line 1 *</label>
                <input value={form.address_line1} onChange={(e) => updateField('address_line1', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="Building, Street" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">Address line 2</label>
                <input value={form.address_line2} onChange={(e) => updateField('address_line2', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="Area, Landmark" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">City *</label>
                  <input value={form.city} onChange={(e) => updateField('city', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">PIN code *</label>
                  <input value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all font-mono" placeholder="400001" maxLength={6} />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#6e6560] mb-2 font-sans">State *</label>
                <select value={form.state} onChange={(e) => updateField('state', e.target.value)} className="w-full px-4 py-3 border border-[#e4dbd0] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5c2040] transition-all appearance-none">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Review your profile</h2>
              <div className="space-y-4">
                {[
                  { label: 'Business name', value: form.business_name },
                  { label: 'Store type', value: STORE_TYPES.find(t => t.value === form.store_type)?.label },
                  { label: 'Location', value: `${form.city}, ${form.state} ${form.pincode}` },
                  { label: 'GST Number', value: form.gst_number || 'Not provided' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3 border-b border-[#e4dbd0]">
                    <span className="text-xs text-[#6e6560] font-sans tracking-wide">{label}</span>
                    <span className="text-sm text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{value || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#f5e8ef] border border-[#d4a0b8] p-5">
                <p className="text-sm text-[#5c2040]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                  Your retailer profile will be reviewed by our team within 24–48 hours. Once approved, you can start placing wholesale orders with a Net-30 payment terms.
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

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-2 px-6 py-3 text-sm text-[#6e6560] font-sans tracking-wide hover:text-[#16120f] transition-colors disabled:opacity-0">
            <ArrowLeft size={14} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="inline-flex items-center gap-2 bg-[#5c2040] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#461832] transition-colors disabled:opacity-40">
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 bg-[#5c2040] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#461832] transition-colors disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit for review'} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
