'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, Clock, CheckCircle, ArrowRight, Search, AlertCircle } from 'lucide-react'
import type { Order, Retailer } from '@/types'
import Navbar from '@/components/layout/Navbar'

function RetailerDashboardContent() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const supabase = createClient()
  const [retailer, setRetailer] = useState<Retailer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ret } = await supabase.from('retailers').select('*').eq('user_id', user.id).single()
      if (ret) {
        setRetailer(ret)
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, brand:brands(name, logo_url)')
          .eq('retailer_id', ret.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setOrders(orderData || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const stats = {
    totalSpend: orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0),
    outstanding: orders.filter(o => o.payment_status === 'pending' && o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0),
    overdueOrders: orders.filter(o => o.payment_status === 'overdue').length,
    activeOrders: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
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
    authorized: 'bg-blue-50 text-blue-700',
  }

  if (loading) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="retailer" />
      <div className="pt-20 lg:pt-24">
        {isWelcome && (
          <div className="bg-[#6b2d4e] text-white px-6 py-4">
            <div className="container-editorial flex items-center gap-3">
              <CheckCircle size={18} className="text-[#c47fa0]" />
              <p className="text-sm font-sans">Your retailer profile has been submitted for review. We&apos;ll notify you within 24–48 hours.</p>
            </div>
          </div>
        )}

        {retailer?.status === 'pending' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="container-editorial flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-sm text-amber-800 font-sans">Your retailer profile is pending review. You can browse brands while we verify your account.</p>
            </div>
          </div>
        )}

        {stats.overdueOrders > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="container-editorial flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-800 font-sans">You have {stats.overdueOrders} overdue payment{stats.overdueOrders > 1 ? 's' : ''}.</p>
              </div>
              <Link href="/retailer/orders?filter=overdue" className="text-xs text-red-700 hover:underline font-sans">View</Link>
            </div>
          </div>
        )}

        <div className="container-editorial py-10">
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="section-label mb-2">Retailer Dashboard</p>
              <h1 className="text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
                {retailer?.business_name || 'Your Store'}
              </h1>
            </div>
            <Link href="/retailer/browse" className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-6 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors">
              <Search size={14} /> Discover Brands
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Spend', value: formatCurrency(stats.totalSpend), icon: CheckCircle, note: 'Paid orders' },
              { label: 'Outstanding', value: formatCurrency(stats.outstanding), icon: Clock, note: 'Due in 30 days' },
              { label: 'Active Orders', value: stats.activeOrders.toString(), icon: ShoppingBag, note: 'In progress' },
              { label: 'Overdue', value: stats.overdueOrders.toString(), icon: AlertCircle, note: stats.overdueOrders > 0 ? 'Action required' : 'All clear', warn: stats.overdueOrders > 0 },
            ].map((stat) => (
              <div key={stat.label} className={`border p-6 ${(stat as any).warn ? 'bg-red-50 border-red-200' : 'bg-white border-[#e8e0d8]'}`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#7a706b] font-sans">{stat.label}</span>
                  <stat.icon size={16} className={(stat as any).warn ? 'text-red-400' : 'text-[#c47fa0]'} />
                </div>
                <div className={`text-2xl font-light mb-1 ${(stat as any).warn ? 'text-red-700' : 'text-[#1a1614]'}`} style={{ fontFamily: 'Georgia, serif' }}>{stat.value}</div>
                <div className="text-xs text-[#7a706b] font-sans">{stat.note}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>Order History</h2>
                <Link href="/retailer/orders" className="text-xs text-[#6b2d4e] font-sans tracking-wide hover:underline">View all</Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white border border-[#e8e0d8] p-12 text-center">
                  <ShoppingBag size={32} className="text-[#e8e0d8] mx-auto mb-4" />
                  <p className="text-[#7a706b] text-sm mb-6" style={{ fontFamily: 'Georgia, serif' }}>You haven&apos;t placed any orders yet.</p>
                  <Link href="/retailer/browse" className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-6 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors">
                    Browse Brands <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-[#e8e0d8] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e8e0d8]">
                        {['Order', 'Brand', 'Amount', 'Status', 'Due date'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#7a706b] font-sans font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#f2ede6] hover:bg-[#faf8f5] transition-colors">
                          <td className="px-4 py-4">
                            <Link href={`/retailer/orders/${order.id}`} className="text-sm font-medium text-[#6b2d4e] hover:underline font-sans">{order.order_number}</Link>
                            <div className="text-xs text-[#7a706b] font-sans mt-0.5">{formatDate(order.created_at)}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{(order.brand as any)?.name || '—'}</td>
                          <td className="px-4 py-4 text-sm font-sans text-[#1a1614]">{formatCurrency(order.total_amount)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${statusColor[order.status] || 'bg-gray-50 text-gray-700'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {order.payment_due_date ? (
                              <span className={`text-xs font-sans ${order.payment_status === 'overdue' ? 'text-red-600 font-medium' : 'text-[#7a706b]'}`}>
                                {formatDate(order.payment_due_date)}
                              </span>
                            ) : (
                              <span className="text-xs text-[#b8b0a8] font-sans">—</span>
                            )}
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
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Account Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Profile', status: retailer?.status === 'approved' ? 'Approved' : 'Pending review', ok: retailer?.status === 'approved' },
                    { label: 'Credit limit', status: formatCurrency(retailer?.credit_limit || 0), ok: true },
                    { label: 'Outstanding', status: formatCurrency(retailer?.outstanding_balance || 0), ok: (retailer?.outstanding_balance || 0) === 0 },
                    { label: 'GST', status: retailer?.gst_number ? 'Provided' : 'Not provided', ok: !!retailer?.gst_number },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#7a706b] font-sans">{item.label}</span>
                      <span className={`text-xs font-sans ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#e8e0d8] p-6">
                <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { href: '/retailer/browse', label: 'Browse brands' },
                    { href: '/retailer/orders', label: 'All orders' },
                    { href: '/retailer/cart', label: 'View cart' },
                    { href: '/retailer/settings', label: 'Edit profile' },
                  ].map((action) => (
                    <Link key={action.href} href={action.href} className="flex items-center justify-between py-2.5 border-b border-[#f2ede6] last:border-0 group">
                      <span className="text-sm text-[#7a706b] group-hover:text-[#1a1614] transition-colors" style={{ fontFamily: 'Georgia, serif' }}>{action.label}</span>
                      <ArrowRight size={12} className="text-[#e8e0d8] group-hover:text-[#6b2d4e] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1614] p-6">
                <h3 className="text-sm font-light text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Net-30 Terms</h3>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  Orders are confirmed immediately. You have <strong className="text-white/80">30 days</strong> from confirmation to process payment.
                </p>
                <Link href="/retailer/browse" className="inline-flex items-center gap-2 mt-4 text-xs text-[#c47fa0] font-sans hover:gap-4 transition-all duration-200 tracking-wide">
                  Browse new brands <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RetailerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>}>
      <RetailerDashboardContent />
    </Suspense>
  )
}
