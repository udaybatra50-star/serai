'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { ArrowLeft, ShoppingBag, Globe, MapPin, CheckCircle, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Brand, Product } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

interface CartItem { product: Product; quantity: number }

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products')
  const [userRole, setUserRole] = useState<'brand' | 'retailer' | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setUserRole(profile?.role || null)
      }

      const { data: brandData } = await supabase
        .from('brands')
        .select('*, categories:brand_categories(category:categories(name, slug))')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (!brandData) { router.push('/retailer/browse'); return }
      setBrand(brandData)

      const { data: productData } = await supabase
        .from('products')
        .select('*, category:categories(name), subcategory:subcategories(name)')
        .eq('brand_id', brandData.id)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      setProducts(productData || [])
      setLoading(false)
    }
    load()
  }, [slug])

  const cartTotal = cart.reduce((sum, item) => sum + item.product.wholesale_price * item.quantity, 0)
  const meetsMinimum = cartTotal >= (brand?.minimum_order_value || 0)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  const getQty = (productId: string) => cart.find((i) => i.product.id === productId)?.quantity || 0

  const handleCheckout = () => {
    localStorage.setItem('serai_cart', JSON.stringify({ brandId: brand?.id, items: cart }))
    router.push(`/retailer/checkout?brand=${brand?.id}`)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!brand) return null

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <Navbar variant="solid" userRole={userRole} />
      <div className="pt-20 lg:pt-24 flex-1">
        {/* Brand hero */}
        <div className="relative">
          <div className="h-56 lg:h-80 bg-[#f5e8ef] relative overflow-hidden">
            {brand.cover_image_url ? (
              <img src={brand.cover_image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #f5e8ef 0%, #e8d4dd 100%)' }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="container-editorial pb-0">
            <div className="relative -mt-16 lg:-mt-20 flex items-end gap-6 pb-6 border-b border-[#e8e0d8]">
              {/* Logo */}
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white border-4 border-white shadow-lg flex items-center justify-center shrink-0">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-4xl font-light text-[#6b2d4e]" style={{ fontFamily: 'Georgia, serif' }}>{brand.name.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>{brand.name}</h1>
                  {brand.is_verified && (
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5">
                      <CheckCircle size={11} />
                      <span className="text-[0.6rem] font-sans tracking-wider uppercase">Verified</span>
                    </div>
                  )}
                </div>
                {brand.tagline && <p className="text-[#7a706b] text-sm" style={{ fontFamily: 'Georgia, serif' }}>{brand.tagline}</p>}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {brand.origin_city && (
                    <span className="flex items-center gap-1 text-xs text-[#7a706b] font-sans"><MapPin size={11} /> {brand.origin_city}, {brand.origin_state}</span>
                  )}
                  {brand.website_url && (
                    <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#7a706b] hover:text-[#6b2d4e] font-sans transition-colors"><Globe size={11} /> Website</a>
                  )}
                  {brand.instagram_handle && (
                    <a href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#7a706b] hover:text-[#6b2d4e] font-sans transition-colors"><Globe size={11} /> {brand.instagram_handle}</a>
                  )}
                </div>
              </div>

              <div className="shrink-0 hidden lg:block text-right pb-2">
                <div className="text-[0.6rem] tracking-[0.15em] uppercase text-[#7a706b] font-sans">Min. order value</div>
                <div className="text-xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{formatCurrency(brand.minimum_order_value)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-editorial py-8">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#e8e0d8] mb-8">
            {(['products', 'about'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-xs tracking-[0.15em] uppercase font-sans border-b-2 transition-all ${activeTab === tab ? 'border-[#6b2d4e] text-[#6b2d4e]' : 'border-transparent text-[#7a706b] hover:text-[#1a1614]'}`}>
                {tab === 'products' ? `Products (${products.length})` : 'About'}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div className="max-w-2xl">
              {brand.description && <p className="text-base text-[#1a1614] leading-relaxed mb-8" style={{ fontFamily: 'Georgia, serif' }}>{brand.description}</p>}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Founded', value: brand.founded_year?.toString() },
                  { label: 'Origin', value: brand.origin_city ? `${brand.origin_city}, ${brand.origin_state}` : null },
                  { label: 'Min. order', value: formatCurrency(brand.minimum_order_value) },
                  { label: 'Payment terms', value: 'Net-30' },
                  { label: 'Payout to brand', value: '7 days' },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex justify-between py-3 border-b border-[#f2ede6]">
                    <span className="text-xs text-[#7a706b] font-sans tracking-wide">{row.label}</span>
                    <span className="text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className={`${cart.length > 0 ? 'lg:pr-80' : ''} transition-all duration-300`}>
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#7a706b] font-sans">No products listed yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const qty = getQty(product.id)
                    const discount = calculateDiscount(product.mrp, product.wholesale_price)

                    return (
                      <div key={product.id} className="bg-white border border-[#e8e0d8] group hover:shadow-lg transition-all duration-300">
                        {/* Product image */}
                        <div className="aspect-square bg-[#f5e8ef] relative overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl font-light text-[#c47fa0]" style={{ fontFamily: 'Georgia, serif' }}>{product.name.charAt(0)}</span>
                            </div>
                          )}
                          {product.is_featured && (
                            <div className="absolute top-2 left-2 bg-[#6b2d4e] text-white px-2 py-0.5">
                              <span className="text-[0.55rem] font-sans tracking-widest uppercase">Featured</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-white px-2 py-0.5">
                            <span className="text-[0.55rem] font-sans tracking-widest uppercase text-emerald-700">{discount}% off MRP</span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-sm font-light text-[#1a1614] mb-1" style={{ fontFamily: 'Georgia, serif' }}>{product.name}</h3>
                          {product.subcategory && <p className="text-[0.6rem] tracking-wide uppercase text-[#b8b0a8] font-sans mb-3">{(product.subcategory as any).name}</p>}

                          <div className="flex items-end gap-2 mb-4">
                            <div>
                              <div className="text-[0.6rem] text-[#7a706b] font-sans tracking-wide">Wholesale</div>
                              <div className="text-base font-medium text-[#1a1614] font-sans">{formatCurrency(product.wholesale_price)}</div>
                            </div>
                            <div className="text-xs text-[#b8b0a8] font-sans line-through mb-0.5">MRP {formatCurrency(product.mrp)}</div>
                          </div>

                          {userRole === 'retailer' && (
                            qty === 0 ? (
                              <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock_quantity === 0}
                                className="w-full py-2.5 bg-[#6b2d4e] text-white text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {product.stock_quantity === 0 ? 'Out of stock' : 'Add to order'}
                              </button>
                            ) : (
                              <div className="flex items-center justify-between border border-[#e8e0d8]">
                                <button onClick={() => updateQty(product.id, -1)} className="p-2.5 text-[#7a706b] hover:text-[#1a1614] transition-colors"><Minus size={14} /></button>
                                <span className="text-sm font-medium text-[#1a1614] font-sans">{qty}</span>
                                <button onClick={() => updateQty(product.id, 1)} className="p-2.5 text-[#7a706b] hover:text-[#1a1614] transition-colors"><Plus size={14} /></button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart summary sidebar */}
        {cart.length > 0 && userRole === 'retailer' && (
          <div className="fixed right-6 top-28 w-72 bg-white border border-[#e8e0d8] shadow-2xl z-40">
            <div className="p-5 border-b border-[#e8e0d8]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>Your Order</h3>
                <span className="text-[0.6rem] font-sans tracking-widest uppercase text-[#7a706b]">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="p-5 max-h-64 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#1a1614] line-clamp-1" style={{ fontFamily: 'Georgia, serif' }}>{item.product.name}</p>
                    <p className="text-[0.6rem] text-[#7a706b] font-sans">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-sans text-[#1a1614] ml-3">{formatCurrency(item.product.wholesale_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[#e8e0d8]">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[#7a706b] font-sans">Subtotal</span>
                <span className="text-sm font-medium text-[#1a1614] font-sans">{formatCurrency(cartTotal)}</span>
              </div>

              {!meetsMinimum && (
                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 mb-3 font-sans">
                  Add {formatCurrency(brand.minimum_order_value - cartTotal)} more to meet min. order of {formatCurrency(brand.minimum_order_value)}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={!meetsMinimum}
                className="w-full py-3 bg-[#6b2d4e] text-white text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag size={13} /> Place Order
              </button>
              <p className="text-[0.6rem] text-center text-[#7a706b] font-sans mt-2">Net-30 payment terms apply</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
