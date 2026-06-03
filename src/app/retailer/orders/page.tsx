'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react'
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

function RetailerOrdersContent() {
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

      const { data: retailer } = await supabase.from('retailers').select('id').eq('user_id', user.id).single()
      if (!retailer) return

      let query = supabase
        .from('orders')
        .select('*, brand:brands(name, logo_url)')
        .eq('retailer_id', retailer.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)

      const { data } = await query
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [statusFilter])

  const overdueOrders = orders.filter((o) => o.payment_status === 'overdue')
  const totalOutstanding = orders
    .filter((o) => ['pending', 'authorized'].includes(o.payment_status) && o.status !== 'cancelled')
    .reduce((s, o) => s + o.total_amount, 0)

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="retailer" />
      <div className="pt-20 lg:pt-24">
        {overdueOrders.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="container-editorial flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-800 font-sans">
                {overdueOrders.length} overdue payment{overdueOrders.length > 1 ? 's' : ''} — total{' '}
                <strong>{formatCurrency(overdueOrders.reduce((s, o) => s + o.total_amount, 0))}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="container-editorial py-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="section-label mb-2">Orders</p>
              <h1 className="text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
                Order History
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/retailer/browse" className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-6 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors">
                Browse Brands
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total orders', value: orders.length.toString() },
              { label: 'Outstanding', value: formatCurrency(totalOutstanding) },
              { label: 'Overdue', value: overdueOrders.length.toString(), warn: overdueOrders.length > 0 },
              { label: 'Completed', value: orders.filter(o => o.status === 'completed').length.toString() },
            ].map((s) => (
              <div key={s.label} className={`border p-5 ${(s as any).warn && overdueOrders.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-[#e8e0d8]'}`}>
                <div className="text-xs text-[#7a706b] font-sans tracking-wide mb-1">{s.label}</div>
                <div className={`text-2xl font-light ${(s as any).warn && overdueOrders.length > 0 ? 'text-red-700' : 'text-[#1a1614]'}`} style={{ fontFamily: 'Georgia, serif' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Status filter */}
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
              <ShoppingBag size={40} className="text-[#e8e0d8] mx-auto mb-4" />
              <p className="text-[#7a706b] text-sm font-sans mb-6">
                {statusFilter !== 'all' ? `No ${statusFilter} orders.` : "You haven't placed any orders yet."}
              </p>
              <Link href="/retailer/browse" className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-8 py-3 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors">
                Browse Brands <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e0d8] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8e0d8] bg-[#faf8f5]">
                    {['Order', 'Brand', 'Amount', 'Status', 'Payment', 'Due date', ''].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-[0.6rem] tracking-[0.15em] uppercase text-[#7a706b] font-sans font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const isOverdue = order.payment_status === 'overdue'
                    return (
                      <tr key={order.id} className={`border-b border-[#f2ede6] transition-colors ${isOverdue ? 'bg-red-50/50' : 'hover:bg-[#faf8f5]'}`}>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-[#6b2d4e] font-sans">{order.order_number}</p>
                          <p className="text-xs text-[#7a706b] font-sans mt-0.5">{formatDate(order.created_at)}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{(order.brand as any)?.name}</td>
                        <td className="px-4 py-4 text-sm font-sans font-medium text-[#1a1614]">{formatCurrency(order.total_amount)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${statusColor[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-0.5 text-[0.6rem] font-medium tracking-wide uppercase font-sans ${paymentColor[order.payment_status] || ''}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {order.payment_due_date ? (
                            <span className={`text-xs font-sans ${isOverdue ? 'text-red-600 font-semibold' : 'text-[#7a706b]'}`}>
                              {formatDate(order.payment_due_date)}
                              {isOverdue && <span className="block text-[0.6rem] text-red-500">Overdue</span>}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/retailer/orders/${order.id}`} className="flex items-center gap-1 text-xs text-[#6b2d4e] hover:underline font-sans">
                            View <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RetailerOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>}>
      <RetailerOrdersContent />
    </Suspense>
  )
}
