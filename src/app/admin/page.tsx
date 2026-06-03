'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, ShoppingBag, TrendingUp, AlertCircle, Check, X, ArrowRight, Tag } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

type AdminTab = 'overview' | 'brands' | 'retailers' | 'orders' | 'categories'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState({ brands: 0, retailers: 0, orders: 0, gmv: 0, pendingBrands: 0, pendingRetailers: 0 })
  const [brands, setBrands] = useState<any[]>([])
  const [retailers, setRetailers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)

    if (activeTab === 'overview') {
      const [brandsRes, retailersRes, ordersRes] = await Promise.all([
        supabase.from('brands').select('id, status', { count: 'exact' }),
        supabase.from('retailers').select('id, status', { count: 'exact' }),
        supabase.from('orders').select('total_amount, payment_status'),
      ])

      const brandRows = brandsRes.data || []
      const retailerRows = retailersRes.data || []
      const orderRows = ordersRes.data || []

      setStats({
        brands: brandsRes.count || 0,
        retailers: retailersRes.count || 0,
        orders: orderRows.length,
        gmv: orderRows.filter(o => o.payment_status === 'paid').reduce((s: number, o: any) => s + o.total_amount, 0),
        pendingBrands: brandRows.filter((b: any) => b.status === 'pending').length,
        pendingRetailers: retailerRows.filter((r: any) => r.status === 'pending').length,
      })
    }

    if (activeTab === 'brands') {
      const { data } = await supabase
        .from('brands')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50)
      setBrands(data || [])
    }

    if (activeTab === 'retailers') {
      const { data } = await supabase
        .from('retailers')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50)
      setRetailers(data || [])
    }

    if (activeTab === 'orders') {
      const { data } = await supabase
        .from('orders')
        .select('*, brand:brands(name), retailer:retailers(business_name)')
        .order('created_at', { ascending: false })
        .limit(50)
      setOrders(data || [])
    }

    if (activeTab === 'categories') {
      const { data } = await supabase
        .from('categories')
        .select('*, subcategories(*)')
        .order('sort_order')
      setCategories(data || [])
    }

    setLoading(false)
  }

  const updateBrandStatus = async (brandId: string, status: 'approved' | 'rejected') => {
    await supabase.from('brands').update({ status }).eq('id', brandId)
    loadData()
  }

  const updateRetailerStatus = async (retailerId: string, status: 'approved' | 'rejected') => {
    await supabase.from('retailers').update({ status }).eq('id', retailerId)
    loadData()
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    suspended: 'bg-gray-100 text-gray-600',
  }

  const paymentColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
    authorized: 'bg-blue-50 text-blue-700',
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      <Navbar variant="solid" userRole="admin" />
      <div className="pt-20 lg:pt-24">
        {(stats.pendingBrands > 0 || stats.pendingRetailers > 0) && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="container-editorial flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-sm text-amber-800 font-sans">
                {stats.pendingBrands > 0 && `${stats.pendingBrands} brand${stats.pendingBrands > 1 ? 's' : ''} awaiting approval.`}
                {stats.pendingBrands > 0 && stats.pendingRetailers > 0 && ' '}
                {stats.pendingRetailers > 0 && `${stats.pendingRetailers} retailer${stats.pendingRetailers > 1 ? 's' : ''} awaiting approval.`}
              </p>
            </div>
          </div>
        )}

        <div className="container-editorial py-10">
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="section-label mb-2">Admin</p>
              <h1 className="text-3xl font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', letterSpacing: '-0.025em' }}>Serai Dashboard</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#e4dbd0] mb-8 overflow-x-auto">
            {([
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'brands', label: `Brands${stats.pendingBrands > 0 ? ` (${stats.pendingBrands})` : ''}`, icon: Users },
              { id: 'retailers', label: `Retailers${stats.pendingRetailers > 0 ? ` (${stats.pendingRetailers})` : ''}`, icon: ShoppingBag },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'categories', label: 'Categories', icon: Tag },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs tracking-[0.12em] uppercase font-sans border-b-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'border-[#5c2040] text-[#5c2040]' : 'border-transparent text-[#6e6560] hover:text-[#16120f]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#5c2040] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* OVERVIEW */}
          {!loading && activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Total Brands', value: stats.brands, icon: Users, sub: `${stats.pendingBrands} pending` },
                  { label: 'Total Retailers', value: stats.retailers, icon: Users, sub: `${stats.pendingRetailers} pending` },
                  { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, sub: 'All time' },
                  { label: 'GMV (Paid)', value: formatCurrency(stats.gmv), icon: TrendingUp, sub: 'Paid orders only' },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#e4dbd0] p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#6e6560] font-sans">{s.label}</span>
                      <s.icon size={16} className="text-[#b87090]" />
                    </div>
                    <div className="text-2xl font-light text-[#16120f] mb-1" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{s.value}</div>
                    <div className="text-xs text-[#6e6560] font-sans">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-[#e4dbd0] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>Pending approvals</h2>
                    <button onClick={() => setActiveTab('brands')} className="text-xs text-[#5c2040] font-sans hover:underline">View brands</button>
                  </div>
                  {stats.pendingBrands === 0 && stats.pendingRetailers === 0 ? (
                    <div className="flex items-center gap-2 py-4">
                      <Check size={16} className="text-emerald-500" />
                      <p className="text-sm text-[#6e6560] font-sans">No pending approvals.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.pendingBrands > 0 && (
                        <button onClick={() => setActiveTab('brands')} className="w-full flex items-center justify-between p-4 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
                          <span className="text-sm text-amber-800 font-sans">{stats.pendingBrands} brand{stats.pendingBrands > 1 ? 's' : ''} awaiting review</span>
                          <ArrowRight size={14} className="text-amber-600" />
                        </button>
                      )}
                      {stats.pendingRetailers > 0 && (
                        <button onClick={() => setActiveTab('retailers')} className="w-full flex items-center justify-between p-4 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
                          <span className="text-sm text-amber-800 font-sans">{stats.pendingRetailers} retailer{stats.pendingRetailers > 1 ? 's' : ''} awaiting review</span>
                          <ArrowRight size={14} className="text-amber-600" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BRANDS */}
          {!loading && activeTab === 'brands' && (
            <div className="bg-white border border-[#e4dbd0] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e4dbd0] bg-[#fdfaf6]">
                    {['Brand', 'Owner', 'Min. order', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#6e6560] font-sans font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b border-[#f2ede6] hover:bg-[#fdfaf6] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{brand.name}</p>
                        <p className="text-xs text-[#6e6560] font-sans mt-0.5">{formatDate(brand.created_at)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#6e6560] font-sans">{brand.profiles?.full_name}</p>
                        <p className="text-xs text-[#b8b0a8] font-sans">{brand.profiles?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-sans text-[#16120f]">{formatCurrency(brand.minimum_order_value)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${statusColor[brand.status] || ''}`}>
                          {brand.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {brand.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateBrandStatus(brand.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-sans hover:bg-emerald-700 transition-colors">
                              <Check size={11} /> Approve
                            </button>
                            <button onClick={() => updateBrandStatus(brand.id, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-sans hover:bg-red-700 transition-colors">
                              <X size={11} /> Reject
                            </button>
                          </div>
                        )}
                        {brand.status === 'approved' && (
                          <button onClick={() => updateBrandStatus(brand.id, 'rejected')} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-sans hover:bg-red-50 transition-colors">Suspend</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {brands.length === 0 && <div className="py-12 text-center text-sm text-[#6e6560] font-sans">No brands found.</div>}
            </div>
          )}

          {/* RETAILERS */}
          {!loading && activeTab === 'retailers' && (
            <div className="bg-white border border-[#e4dbd0] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e4dbd0] bg-[#fdfaf6]">
                    {['Business', 'Owner', 'Location', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#6e6560] font-sans font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retailers.map((retailer) => (
                    <tr key={retailer.id} className="border-b border-[#f2ede6] hover:bg-[#fdfaf6] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{retailer.business_name}</p>
                        <p className="text-xs text-[#6e6560] font-sans">{retailer.store_type}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#6e6560] font-sans">{retailer.profiles?.full_name}</p>
                        <p className="text-xs text-[#b8b0a8] font-sans">{retailer.profiles?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#6e6560] font-sans">{retailer.city}, {retailer.state}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${statusColor[retailer.status] || ''}`}>
                          {retailer.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {retailer.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateRetailerStatus(retailer.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-sans hover:bg-emerald-700 transition-colors">
                              <Check size={11} /> Approve
                            </button>
                            <button onClick={() => updateRetailerStatus(retailer.id, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-sans hover:bg-red-700 transition-colors">
                              <X size={11} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {retailers.length === 0 && <div className="py-12 text-center text-sm text-[#6e6560] font-sans">No retailers found.</div>}
            </div>
          )}

          {/* ORDERS */}
          {!loading && activeTab === 'orders' && (
            <div className="bg-white border border-[#e4dbd0] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e4dbd0] bg-[#fdfaf6]">
                    {['Order #', 'Brand', 'Retailer', 'Amount', 'Status', 'Payment', 'Due date'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#6e6560] font-sans font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#f2ede6] hover:bg-[#fdfaf6] transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-[#5c2040] font-sans">{order.order_number}</p>
                        <p className="text-xs text-[#6e6560] font-sans">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#16120f] font-sans">{order.brand?.name}</td>
                      <td className="px-4 py-3.5 text-sm text-[#16120f] font-sans">{order.retailer?.business_name}</td>
                      <td className="px-4 py-3.5 text-sm font-sans">{formatCurrency(order.total_amount)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-sans tracking-wide uppercase ${(({ pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700', shipped: 'bg-indigo-50 text-indigo-700', delivered: 'bg-emerald-50 text-emerald-700', completed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-red-50 text-red-700' } as Record<string, string>)[order.status]) || 'bg-gray-50 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-sans tracking-wide uppercase ${paymentColor[order.payment_status] || 'bg-gray-50 text-gray-600'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#6e6560] font-sans">
                        {order.payment_due_date ? formatDate(order.payment_due_date) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="py-12 text-center text-sm text-[#6e6560] font-sans">No orders yet.</div>}
            </div>
          )}

          {/* CATEGORIES */}
          {!loading && activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6e6560] font-sans">Categories are seeded from the database schema. To add new categories, run SQL migrations.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white border border-[#e4dbd0] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-light text-[#16120f]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{cat.name}</h3>
                      <span className={`text-[0.6rem] font-sans tracking-widest uppercase px-2 py-0.5 ${cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {cat.description && <p className="text-xs text-[#6e6560] mb-4 font-sans">{cat.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories?.map((sub: any) => (
                        <span key={sub.id} className="px-3 py-1 bg-[#f2ede6] text-xs text-[#6e6560] font-sans">{sub.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#f5e8ef] border border-[#d4a0b8] p-5">
                <p className="text-sm text-[#5c2040] font-sans">
                  <strong>Adding new categories:</strong> To add new product categories (e.g. Fashion, Home), insert rows into the <code className="bg-white px-1.5 py-0.5 text-xs">categories</code> and <code className="bg-white px-1.5 py-0.5 text-xs">subcategories</code> tables via Supabase SQL editor. The frontend category filters will pick them up automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
