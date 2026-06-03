'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { Search, Filter, ArrowRight, X } from 'lucide-react'
import type { Brand, Category, Subcategory } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [maxMov, setMaxMov] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function loadMeta() {
      const [{ data: cats }, { data: subs }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('subcategories').select('*').eq('is_active', true).order('sort_order'),
      ])
      setCategories(cats || [])
      setSubcategories(subs || [])
    }
    loadMeta()
  }, [])

  useEffect(() => {
    async function loadBrands() {
      setLoading(true)
      let query = supabase
        .from('brands')
        .select(`
          *,
          brand_categories!inner(category_id),
          categories:brand_categories(category:categories(id, name, slug))
        `)
        .eq('status', 'approved')
        .eq('is_active', true)

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      if (maxMov) {
        query = query.lte('minimum_order_value', parseInt(maxMov))
      }

      const { data } = await query.order('created_at', { ascending: false })
      setBrands(data || [])
      setLoading(false)
    }
    loadBrands()
  }, [searchQuery, selectedCategory, maxMov])

  const filteredSubcategories = subcategories.filter((s) => {
    const cat = categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase())
    return cat ? s.category_id === cat.id : false
  })

  const movOptions = [
    { label: 'Any MOV', value: '' },
    { label: 'Under ₹2,000', value: '2000' },
    { label: 'Under ₹5,000', value: '5000' },
    { label: 'Under ₹10,000', value: '10000' },
    { label: 'Under ₹25,000', value: '25000' },
  ]

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <Navbar variant="solid" userRole="retailer" />
      <div className="pt-20 lg:pt-24 flex-1">
        {/* Search hero */}
        <div className="bg-white border-b border-[#e8e0d8] py-10">
          <div className="container-editorial">
            <p className="section-label mb-4">Discover</p>
            <h1 className="text-3xl lg:text-4xl font-light text-[#1a1614] mb-8" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
              Browse premium brands
            </h1>
            {/* Search bar */}
            <div className="flex gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a8]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-[#e8e0d8] bg-white text-sm text-[#1a1614] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all"
                  placeholder="Search brands by name, category..."
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3.5 border text-sm font-sans transition-all ${showFilters ? 'bg-[#6b2d4e] text-white border-[#6b2d4e]' : 'border-[#e8e0d8] text-[#7a706b] hover:border-[#6b2d4e]'}`}
              >
                <Filter size={14} /> Filters
              </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="mt-5 p-6 bg-[#faf8f5] border border-[#e8e0d8] max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category filter */}
                  <div>
                    <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Category</label>
                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('') }} className="w-full px-4 py-2.5 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] appearance-none">
                      <option value="">All categories</option>
                      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Subcategory filter */}
                  <div>
                    <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Subcategory</label>
                    <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory} className="w-full px-4 py-2.5 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] appearance-none disabled:opacity-50">
                      <option value="">All</option>
                      {filteredSubcategories.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* MOV filter */}
                  <div>
                    <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Min. order value</label>
                    <select value={maxMov} onChange={(e) => setMaxMov(e.target.value)} className="w-full px-4 py-2.5 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] appearance-none">
                      {movOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Active filters */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {selectedCategory && (
                    <button onClick={() => setSelectedCategory('')} className="flex items-center gap-1.5 px-3 py-1 bg-[#f5e8ef] text-[#6b2d4e] text-xs font-sans">
                      {selectedCategory} <X size={10} />
                    </button>
                  )}
                  {maxMov && (
                    <button onClick={() => setMaxMov('')} className="flex items-center gap-1.5 px-3 py-1 bg-[#f5e8ef] text-[#6b2d4e] text-xs font-sans">
                      Under ₹{parseInt(maxMov).toLocaleString('en-IN')} <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Category pills */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
              <button onClick={() => setSelectedCategory('')} className={`px-5 py-2 text-xs font-sans tracking-wide whitespace-nowrap border transition-all ${!selectedCategory ? 'bg-[#1a1614] text-white border-[#1a1614]' : 'border-[#e8e0d8] text-[#7a706b] hover:border-[#1a1614]'}`}>
                All Brands
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.name === selectedCategory ? '' : cat.name)} className={`px-5 py-2 text-xs font-sans tracking-wide whitespace-nowrap border transition-all ${selectedCategory === cat.name ? 'bg-[#6b2d4e] text-white border-[#6b2d4e]' : 'border-[#e8e0d8] text-[#7a706b] hover:border-[#6b2d4e]'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container-editorial py-12">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-[#7a706b] font-sans">
              {loading ? 'Loading...' : `${brands.length} brand${brands.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-[#e8e0d8] animate-pulse">
                  <div className="aspect-[4/3] bg-[#f2ede6]" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-[#f2ede6] w-3/4" />
                    <div className="h-3 bg-[#f2ede6] w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-xl font-light text-[#1a1614] mb-3" style={{ fontFamily: 'Georgia, serif' }}>No brands found</p>
              <p className="text-[#7a706b] text-sm font-sans mb-6">Try adjusting your filters or search terms</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory(''); setMaxMov('') }} className="text-sm text-[#6b2d4e] hover:underline font-sans">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={`/brands/${brand.slug}`} className="group bg-white border border-[#e8e0d8] overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 block">
      {/* Cover image */}
      <div className="aspect-[4/3] bg-[#f5e8ef] relative overflow-hidden">
        {brand.cover_image_url ? (
          <img src={brand.cover_image_url} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-[#e8d4dd] flex items-center justify-center">
              <span className="text-2xl font-light text-[#6b2d4e]" style={{ fontFamily: 'Georgia, serif' }}>
                {brand.name.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Logo overlay */}
        {brand.logo_url && (
          <div className="absolute bottom-3 left-3 w-10 h-10 bg-white border border-[#e8e0d8] p-1">
            <img src={brand.logo_url} alt="" className="w-full h-full object-contain" />
          </div>
        )}

        {/* Verified badge */}
        {brand.is_verified && (
          <div className="absolute top-3 right-3 bg-white px-2 py-1">
            <span className="text-[0.55rem] font-sans tracking-widest uppercase text-[#6b2d4e]">Verified</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="text-base font-light text-[#1a1614] mb-1 group-hover:text-[#6b2d4e] transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
          {brand.name}
        </h3>
        {brand.tagline && (
          <p className="text-xs text-[#7a706b] line-clamp-2 mb-4" style={{ fontFamily: 'Georgia, serif' }}>{brand.tagline}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[0.6rem] tracking-[0.12em] uppercase text-[#7a706b] font-sans">Min. order</div>
            <div className="text-sm font-medium text-[#1a1614] font-sans">{formatCurrency(brand.minimum_order_value)}</div>
          </div>
          <div className="flex items-center gap-1 text-[#6b2d4e] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-sans tracking-wide">View</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {brand.origin_city && (
          <div className="mt-3 pt-3 border-t border-[#f2ede6]">
            <span className="text-[0.6rem] tracking-[0.12em] uppercase text-[#b8b0a8] font-sans">{brand.origin_city}, {brand.origin_state}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>}>
      <BrowseContent />
    </Suspense>
  )
}
