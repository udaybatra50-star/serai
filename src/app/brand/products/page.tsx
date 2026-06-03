'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Plus, Package, Edit, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import type { Product } from '@/types'
import Navbar from '@/components/layout/Navbar'

export default function BrandProductsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/signin')

      const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()
      if (!brand) return router.push('/onboarding/brand')
      setBrandId(brand.id)

      const { data } = await supabase
        .from('products')
        .select('*, category:categories(name), subcategory:subcategories(name)')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })

      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleActive = async (productId: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', productId)
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, is_active: !current } : p))
  }

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="brand" />
      <div className="pt-20 lg:pt-24">
        <div className="container-editorial py-10">
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="section-label mb-2">Catalogue</p>
              <h1 className="text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
                Your Products
              </h1>
            </div>
            <Link
              href="/brand/products/new"
              className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-6 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors"
            >
              <Plus size={14} /> Add Product
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total products', value: products.length },
              { label: 'Active', value: products.filter((p) => p.is_active).length },
              { label: 'Featured', value: products.filter((p) => p.is_featured).length },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#e8e0d8] p-5">
                <div className="text-2xl font-light text-[#1a1614] mb-1" style={{ fontFamily: 'Georgia, serif' }}>{s.value}</div>
                <div className="text-xs text-[#7a706b] font-sans tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm mb-6">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all"
              placeholder="Search by name or SKU..."
            />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#e8e0d8] p-16 text-center">
              <Package size={40} className="text-[#e8e0d8] mx-auto mb-4" />
              <p className="text-[#1a1614] text-lg font-light mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {search ? 'No products match your search' : 'No products yet'}
              </p>
              <p className="text-[#7a706b] text-sm mb-8 font-sans">
                {search ? 'Try a different search term' : 'Start building your wholesale catalogue'}
              </p>
              {!search && (
                <Link
                  href="/brand/products/new"
                  className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-8 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors"
                >
                  <Plus size={14} /> Add first product
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#e8e0d8] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8e0d8] bg-[#faf8f5]">
                    {['Product', 'SKU', 'Category', 'MRP', 'Wholesale', 'Stock', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#7a706b] font-sans font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-[#f2ede6] hover:bg-[#faf8f5] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f5e8ef] shrink-0 flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm text-[#c47fa0]" style={{ fontFamily: 'Georgia, serif' }}>{product.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{product.name}</p>
                            {product.is_featured && (
                              <span className="text-[0.55rem] font-sans tracking-widest uppercase text-[#6b2d4e] bg-[#f5e8ef] px-1.5 py-0.5">Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-[#7a706b]">{product.sku}</td>
                      <td className="px-5 py-4 text-xs text-[#7a706b] font-sans">{(product.category as any)?.name}</td>
                      <td className="px-5 py-4 text-sm font-sans text-[#7a706b]">{formatCurrency(product.mrp)}</td>
                      <td className="px-5 py-4 text-sm font-sans font-medium text-[#1a1614]">{formatCurrency(product.wholesale_price)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-sans ${product.stock_quantity === 0 ? 'text-red-500' : product.stock_quantity < 10 ? 'text-amber-600' : 'text-[#1a1614]'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className="flex items-center gap-1.5 text-xs font-sans transition-colors"
                        >
                          {product.is_active ? (
                            <><ToggleRight size={18} className="text-emerald-500" /><span className="text-emerald-700">Active</span></>
                          ) : (
                            <><ToggleLeft size={18} className="text-[#b8b0a8]" /><span className="text-[#7a706b]">Inactive</span></>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/brand/products/${product.id}/edit`}
                          className="text-xs text-[#6b2d4e] hover:underline font-sans flex items-center gap-1"
                        >
                          <Edit size={11} /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
