'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, ArrowRight } from 'lucide-react'
import type { Order } from '@/types'
import Navbar from '@/components/layout/Navbar'

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']

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
  authorized: 'bg-blue-50 text-blue-700',
  paid: 'bg-emerald-50 text-emerald-700',
  overdue: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

function BrandOrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/signin')

      const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()
      if (!brand) return

      let query = supabase
        .from('orders')
        .select('*, retailer:retailers(business_name, city, state)')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)

      const { data } = await query
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [statusFilter])

  const totals = {
    all: orders.length,
    revenue: orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total_amount, 0),
    pending_payout: orders.filter(o => o.brand_payout_status === 'pending' && ['confirmed','processing','shipped','delivered'].includes(o.status)).reduce((s, o) => s + o.total_amount, 0),
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="brand" />
      <div className="pt-20 lg:pt-24">
        <div className="container-editorial py-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="section-label mb-2">Orders</p>
              <h1 className="text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
                All Orders
              </h1>
            </div>
            <Link href="/brand/dashboard" className="text-xs text-[#7a706b] hover:text-[#1a1614] font-sans tracking-wide transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-[#e8e0d8] p-5">
              <div className="text-xs text-[#7a706b] font-sans tracking-wide mb-1">Total orders</div>
              <div className="text-2xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{totals.all}</div>
            </div>
            <div className="bg-white border border-[#e8e0d8] p-5">
              <div className="text-xs text-[#7a706b] font-sans tracking-wide mb-1">Revenue received</div>
              <div className="text-2xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{formatCurrency(totals.revenue)}</div>
            </div>
            <div className="bg-white border border-[#e8e0d8] p-5">
              <div className="text-xs text-[#7a706b] font-sans tracking-wide mb-1">Pending payout</div>
              <div className="text-2xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{formatCurrency(totals.pending_payout)}</div>
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-0 overflow-x-auto border-b border-[#e8e0d8] mb-6">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-3 text-xs tracking-[0.12em] uppercase font-sans border-b-2 whitespace-nowrap transition-all capitalize ${statusFilter === s ? 'border-[#6b2d4e] text-[#6b2d4e]' : 'border-transparent text-[#7a706b] hover:text-[#1a1614]'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[#e8e0d8] p-16 text-center">
              <Package size={40} className="text-[#e8e0d8] mx-auto mb-4" />
              <p className="text-[#7a706b] text-sm font-sans">No {statusFilter !== 'all' ? statusFilter : ''} orders found.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e0d8] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8e0d8] bg-[#faf8f5]">
                    {['Order', 'Retailer', 'Amount', 'Status', 'Payment', 'Due date', 'Payout', ''].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#7a706b] font-sans font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#f2ede6] hover:bg-[#faf8f5] transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-[#6b2d4e] font-sans">{order.order_number}</p>
                        <p className="text-xs text-[#7a706b] font-sans mt-0.5">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{(order.retailer as any)?.business_name}</p>
                        <p className="text-xs text-[#7a706b] font-sans">{(order.retailer as any)?.city}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-sans font-medium text-[#1a1614]">{formatCurrency(order.total_amount)}</td>
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
                      <td className="px-4 py-4 text-xs text-[#7a706b] font-sans">
                        {order.payment_due_date ? formatDate(order.payment_due_date) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-sans ${order.brand_payout_status === 'paid' ? 'text-emerald-600' : order.brand_payout_status === 'scheduled' ? 'text-blue-600' : 'text-[#7a706b]'}`}>
                          {order.brand_payout_status}
                          {order.brand_payout_date && order.brand_payout_status !== 'paid' && (
                            <span className="block text-[0.6rem] text-[#b8b0a8]">{formatDate(order.brand_payout_date)}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/brand/orders/${order.id}`} className="flex items-center gap-1 text-xs text-[#6b2d4e] hover:underline font-sans">
                          View <ArrowRight size={11} />
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

export default function BrandOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>}>
      <BrandOrdersContent />
    </Suspense>
  )
}
