'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import type { Category, Subcategory } from '@/types'
import Navbar from '@/components/layout/Navbar'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brandId, setBrandId] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    ingredients: '',
    how_to_use: '',
    benefits: '',
    category_id: '',
    subcategory_id: '',
    mrp: '',
    wholesale_price: '',
    stock_quantity: '',
    minimum_order_quantity: '1',
    weight_grams: '',
    tags: '',
    is_featured: false,
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/signin')

      const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()
      if (brand) setBrandId(brand.id)

      const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      const { data: subs } = await supabase.from('subcategories').select('*').eq('is_active', true).order('sort_order')
      setCategories(cats || [])
      setSubcategories(subs || [])
    }
    load()
  }, [])

  const filteredSubs = subcategories.filter((s) => s.category_id === form.category_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandId) return
    setLoading(true)
    setError('')

    try {
      const validImages = imageUrls.filter((u) => u.trim())
      await supabase.from('products').insert({
        brand_id: brandId,
        category_id: form.category_id,
        subcategory_id: form.subcategory_id || null,
        name: form.name,
        sku: form.sku,
        description: form.description,
        ingredients: form.ingredients,
        how_to_use: form.how_to_use,
        benefits: form.benefits,
        mrp: parseFloat(form.mrp),
        wholesale_price: parseFloat(form.wholesale_price),
        stock_quantity: parseInt(form.stock_quantity) || 0,
        minimum_order_quantity: parseInt(form.minimum_order_quantity),
        weight_grams: form.weight_grams ? parseInt(form.weight_grams) : null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images: validImages,
        is_featured: form.is_featured,
      })
      router.push('/brand/products')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="brand" />
      <div className="pt-20 lg:pt-24">
        <div className="container-editorial py-10 max-w-3xl">
          <Link href="/brand/products" className="inline-flex items-center gap-2 text-xs text-[#7a706b] hover:text-[#1a1614] font-sans tracking-wide mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to products
          </Link>

          <p className="section-label mb-2">New Product</p>
          <h1 className="text-3xl font-light text-[#1a1614] mb-10" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
            Add to your catalogue
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic info */}
            <div className="bg-white border border-[#e8e0d8] p-8 space-y-6">
              <h2 className="text-base font-light text-[#1a1614] pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Product details</h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Product name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="e.g. Rose Hip Glow Serum 30ml" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">SKU *</label>
                  <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all font-mono" placeholder="SKU-001" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Weight (grams)</label>
                  <input type="number" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="30" />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="Product description for retailers" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Key benefits</label>
                <textarea rows={2} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="e.g. Brightening, anti-aging, hydrating" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Ingredients</label>
                <textarea rows={2} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="Rosehip oil, Vitamin C, Hyaluronic acid..." />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">How to use</label>
                <textarea rows={2} value={form.how_to_use} onChange={(e) => setForm({ ...form, how_to_use: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="Application instructions for retailers to share with customers" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="serum, brightening, vitamin-c, anti-aging" />
              </div>
            </div>

            {/* Category */}
            <div className="bg-white border border-[#e8e0d8] p-8 space-y-5">
              <h2 className="text-base font-light text-[#1a1614] pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Category</h2>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Category *</label>
                  <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: '' })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all appearance-none">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Subcategory</label>
                  <select value={form.subcategory_id} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })} disabled={!form.category_id} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all appearance-none disabled:opacity-50">
                    <option value="">Select subcategory</option>
                    {filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-[#e8e0d8] p-8 space-y-5">
              <h2 className="text-base font-light text-[#1a1614] pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Pricing & inventory</h2>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">MRP (₹) *</label>
                  <input required type="number" step="0.01" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="999" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Wholesale price (₹) *</label>
                  <input required type="number" step="0.01" value={form.wholesale_price} onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="499" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Stock quantity</label>
                  <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="100" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Min. order quantity</label>
                  <input type="number" min="1" value={form.minimum_order_quantity} onChange={(e) => setForm({ ...form, minimum_order_quantity: e.target.value })} className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder="1" />
                </div>
              </div>
              {form.mrp && form.wholesale_price && (
                <div className="bg-[#f5e8ef] px-4 py-3 text-sm text-[#6b2d4e] font-sans">
                  Retailer margin: {Math.round(((parseFloat(form.mrp) - parseFloat(form.wholesale_price)) / parseFloat(form.mrp)) * 100)}% ({formatDiscount(parseFloat(form.mrp), parseFloat(form.wholesale_price))})
                </div>
              )}
            </div>

            {/* Images */}
            <div className="bg-white border border-[#e8e0d8] p-8 space-y-5">
              <h2 className="text-base font-light text-[#1a1614] pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Product images</h2>
              <p className="text-xs text-[#7a706b] font-sans">Add image URLs (hosted on your CDN or storage). First image is the main product image.</p>
              <div className="space-y-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-3">
                    <input value={url} onChange={(e) => { const u = [...imageUrls]; u[i] = e.target.value; setImageUrls(u) }} className="flex-1 px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all" placeholder={`Image ${i + 1} URL`} />
                    {imageUrls.length > 1 && (
                      <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))} className="p-3 text-[#7a706b] hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {imageUrls.length < 6 && (
                  <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} className="inline-flex items-center gap-2 text-xs text-[#6b2d4e] font-sans tracking-wide hover:underline">
                    <Upload size={12} /> Add another image
                  </button>
                )}
              </div>
            </div>

            {/* Featured toggle */}
            <div className="bg-white border border-[#e8e0d8] p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>Mark as featured product</p>
                <p className="text-xs text-[#7a706b] font-sans mt-0.5">Featured products appear prominently on your brand page</p>
              </div>
              <button type="button" onClick={() => setForm({ ...form, is_featured: !form.is_featured })} className={`w-12 h-6 transition-colors duration-200 relative ${form.is_featured ? 'bg-[#6b2d4e]' : 'bg-[#e8e0d8]'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white transition-transform duration-200 ${form.is_featured ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-xs text-red-700 font-sans">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Link href="/brand/products" className="flex-1 py-3 text-sm text-center border border-[#e8e0d8] text-[#7a706b] hover:text-[#1a1614] font-sans tracking-wide transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#6b2d4e] text-white text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors disabled:opacity-60">
                {loading ? 'Saving...' : 'Add to catalogue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function formatDiscount(mrp: number, wholesale: number): string {
  const saved = mrp - wholesale
  return `₹${saved.toLocaleString('en-IN')} off MRP`
}
