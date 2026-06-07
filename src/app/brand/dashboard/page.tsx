'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, TrendingUp, Clock, CheckCircle, ArrowRight, Plus, AlertCircle } from 'lucide-react'
import type { Brand, Order } from '@/types'
import Navbar from '@/components/layout/Navbar'

function BrandDashboardContent() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const supabase = createClient()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: brandData } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (brandData) {
        setBrand(brandData)
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, retailer:retailers(business_name, city), items:order_items(count)')
          .eq('brand_id', brandData.id)
          .order('created_at', { ascending: false })
          .limit(20)

        setOrders(orderData || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const stats = {
    totalRevenue: orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0),
    pendingPayouts: orders.filter(o => o.brand_payout_status === 'pending' && o.status === 'confirmed').reduce((s, o) => s + o.total_amount, 0),
    activeOrders: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    totalOrders: orders.length,
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-purple-50 text-purple-700',
    shipped: 'bg-indigo-50 text-indigo-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
  }

  const paymentColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
    failed: 'bg-red-50 text-red-700',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Navbar variant="solid" userRole="brand" />
      <div className="pt-20 lg:pt-24">
        {/* Welcome banner */}
        {isWelcome && (
          <div className="bg-[#1C1C1A] text-white px-6 py-4">
            <div className="container-editorial flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} style={{ color: '#B08D57' }} />
                <p className="text-sm font-sans">Your brand profile has been submitted for review. We&apos;ll notify you within 24–48 hours.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending approval notice */}
        {brand?.status === 'pending' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="container-editorial flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-sm text-amber-800 font-sans">Your brand is pending review. You can set up your products while we verify your profile.</p>
            </div>
          </div>
        )}

        <div className="container-editorial py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B08D57', marginBottom: '0.5rem' }}>
                Brand Dashboard
              </p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.9rem', fontWeight: 400, letterSpacing: '-0.025em', color: '#1C1C1A' }}>
                {brand?.name || 'Your Brand'}
              </h1>
            </div>
            <Link href="/brand/products/new" className="inline-flex items-center gap-2 bg-[#B08D57] text-white px-6 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#9a7a48] transition-colors">
              <Plus size={14} /> Add Product
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, note: 'Completed orders' },
              { label: 'Pending Payout', value: formatCurrency(stats.pendingPayouts), icon: Clock, note: 'Due within 7 days' },
              { label: 'Active Orders', value: stats.activeOrders.toString(), icon: Package, note: 'In progress' },
              { label: 'Total Orders', value: stats.totalOrders.toString(), icon: CheckCircle, note: 'All time' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#E8E4D9] p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#8A8880] font-sans">{stat.label}</span>
                  <stat.icon size={16} style={{ color: '#B08D57' }} />
                </div>
                <div className="text-2xl font-light text-[#1C1C1A] mb-1" style={{ fontFamily: 'Georgia, serif' }}>{stat.value}</div>
                <div className="text-xs text-[#8A8880] font-sans">{stat.note}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders table */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-[#1C1C1A]" style={{ fontFamily: 'Georgia, serif' }}>Recent Orders</h2>
                <Link href="/brand/orders" className="text-xs text-[#B08D57] font-sans tracking-wide hover:underline">View all</Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white border border-[#E8E4D9] p-12 text-center">
                  <Package size={32} className="text-[#E8E4D9] mx-auto mb-4" />
                  <p className="text-[#8A8880] text-sm" style={{ fontFamily: 'Georgia, serif' }}>No orders yet. Once retailers place orders, they&apos;ll appear here.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#E8E4D9] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E8E4D9]">
                        {['Order', 'Retailer', 'Amount', 'Status', 'Payment'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#8A8880] font-sans font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#F0EBE1] hover:bg-[#FAFAF5] transition-colors">
                          <td className="px-4 py-4">
                            <Link href={`/brand/orders/${order.id}`} className="text-sm font-medium text-[#B08D57] hover:underline font-sans">{order.order_number}</Link>
                            <div className="text-xs text-[#8A8880] font-sans mt-0.5">{formatDate(order.created_at)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-[#1C1C1A]" style={{ fontFamily: 'Georgia, serif' }}>{(order.retailer as any)?.business_name || '—'}</span>
                            <div className="text-xs text-[#8A8880] font-sans">{(order.retailer as any)?.city}</div>
                          </td>
                          <td className="px-4 py-4 text-sm font-sans text-[#1C1C1A]">{formatCurrency(order.total_amount)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${statusColor[order.status] || 'bg-gray-50 text-gray-700'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${paymentColor[order.payment_status] || 'bg-gray-50 text-gray-700'}`}>
                              {order.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Brand status card */}
              <div className="bg-white border border-[#E8E4D9] p-6">
                <h3 className="text-sm font-light text-[#1C1C1A] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Brand Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Profile', status: brand?.status === 'approved' ? 'Approved' : 'Pending review', ok: brand?.status === 'approved' },
                    { label: 'Products', status: 'Add your catalogue', ok: false },
                    { label: 'Bank details', status: 'Connected', ok: true },
                    { label: 'GST verification', status: brand?.gst_number ? 'Provided' : 'Pending', ok: !!brand?.gst_number },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#8A8880] font-sans">{item.label}</span>
                      <span className={`text-xs font-sans ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white border border-[#E8E4D9] p-6">
                <h3 className="text-sm font-light text-[#1C1C1A] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { href: '/brand/products/new', label: 'Add new product' },
                    { href: '/brand/products', label: 'Manage catalogue' },
                    { href: '/brand/orders', label: 'View all orders' },
                    { href: '/brand/settings', label: 'Edit brand profile' },
                  ].map((action) => (
                    <Link key={action.href} href={action.href} className="flex items-center justify-between py-2.5 border-b border-[#F0EBE1] last:border-0 group">
                      <span className="text-sm text-[#4A4A45] group-hover:text-[#1C1C1A] transition-colors" style={{ fontFamily: 'Georgia, serif' }}>{action.label}</span>
                      <ArrowRight size={12} className="text-[#E8E4D9] group-hover:text-[#B08D57] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Payment terms */}
              <div className="bg-[#F0E8D5] border border-[#D4B896] p-6">
                <h3 className="text-sm font-light text-[#1C1C1A] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Payment Terms</h3>
                <p className="text-xs leading-relaxed font-sans" style={{ color: '#4A4A45' }}>
                  Retailers pay within <strong>30 days</strong> of order confirmation. Your payout is processed within <strong>7 days</strong> — we bridge the gap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrandDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin" /></div>}>
      <BrandDashboardContent />
    </Suspense>
  )
}
