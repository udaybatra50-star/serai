'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, MapPin, Truck } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'
import Navbar from '@/components/layout/Navbar'

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

const ORDER_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'completed']

export default function BrandOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingInput, setTrackingInput] = useState('')
  const [notesInput, setNotesInput] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/signin')

      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          retailer:retailers(business_name, city, state, pincode),
          items:order_items(*, product:products(name, sku, images))
        `)
        .eq('id', id)
        .single()

      if (!data) return router.push('/brand/orders')
      setOrder(data)
      setTrackingInput(data.tracking_number || '')
      setNotesInput(data.brand_notes || '')
      setLoading(false)
    }
    load()
  }, [id])

  const updateStatus = async (status: string) => {
    if (!order) return
    setUpdating(true)
    const updates: Record<string, unknown> = { status }
    if (status === 'shipped') updates.shipped_at = new Date().toISOString()
    if (status === 'delivered') updates.delivered_at = new Date().toISOString()

    const { data } = await supabase.from('orders').update(updates).eq('id', order.id).select().single()
    if (data) setOrder({ ...order, ...data })
    setUpdating(false)
  }

  const saveTracking = async () => {
    if (!order) return
    setUpdating(true)
    const { data } = await supabase
      .from('orders')
      .update({ tracking_number: trackingInput, brand_notes: notesInput })
      .eq('id', order.id)
      .select()
      .single()
    if (data) setOrder({ ...order, ...data })
    setUpdating(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!order) return null

  const currentStatusIndex = ORDER_STATUSES.indexOf(order.status)

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="brand" />
      <div className="pt-20 lg:pt-24">
        <div className="container-editorial py-10 max-w-5xl">
          <Link href="/brand/orders" className="inline-flex items-center gap-2 text-xs text-[#7a706b] hover:text-[#1a1614] font-sans tracking-wide mb-8 transition-colors">
            <ArrowLeft size={14} /> All orders
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="section-label mb-2">Order Detail</p>
              <h1 className="text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
                {order.order_number}
              </h1>
              <p className="text-sm text-[#7a706b] font-sans mt-1">{formatDate(order.created_at)}</p>
            </div>
            <div className="flex gap-3">
              <span className={`inline-flex px-3 py-1.5 text-xs font-medium tracking-wide uppercase font-sans ${statusColor[order.status] || ''}`}>
                {order.status}
              </span>
              <span className={`inline-flex px-3 py-1.5 text-xs font-medium tracking-wide uppercase font-sans ${paymentColor[order.payment_status] || ''}`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-white border border-[#e8e0d8] p-6 mb-6">
            <h2 className="text-sm font-light text-[#1a1614] mb-5" style={{ fontFamily: 'Georgia, serif' }}>Order Progress</h2>
            <div className="flex items-center">
              {ORDER_STATUSES.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 flex items-center justify-center text-xs transition-all ${i <= currentStatusIndex ? 'bg-[#6b2d4e] text-white' : 'bg-[#e8e0d8] text-[#7a706b]'}`}>
                      {i < currentStatusIndex ? '✓' : i + 1}
                    </div>
                    <span className={`text-[0.55rem] font-sans tracking-wide mt-1.5 capitalize ${i <= currentStatusIndex ? 'text-[#6b2d4e]' : 'text-[#b8b0a8]'}`}>{s}</span>
                  </div>
                  {i < ORDER_STATUSES.length - 1 && (
                    <div className={`flex-1 h-px mx-2 mb-4 ${i < currentStatusIndex ? 'bg-[#6b2d4e]' : 'bg-[#e8e0d8]'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Advance status buttons */}
            {!['completed', 'cancelled'].includes(order.status) && (
              <div className="mt-6 pt-5 border-t border-[#f2ede6] flex gap-3 flex-wrap">
                {ORDER_STATUSES.filter((s, i) => i === currentStatusIndex + 1).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => updateStatus(nextStatus)}
                    disabled={updating}
                    className="inline-flex items-center gap-2 bg-[#6b2d4e] text-white px-5 py-2.5 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors disabled:opacity-60"
                  >
                    <Truck size={12} /> Mark as {nextStatus}
                  </button>
                ))}
                {order.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus('cancelled')}
                    disabled={updating}
                    className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-5 py-2.5 text-xs tracking-[0.1em] uppercase font-sans hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    Cancel order
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h2 className="text-sm font-light text-[#1a1614] mb-5 pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Items ordered</h2>
                <div className="space-y-4">
                  {(order.items as any[])?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-[#f2ede6] last:border-0">
                      <div className="w-14 h-14 bg-[#f5e8ef] shrink-0 overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-[#c47fa0]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{item.product?.name}</p>
                        <p className="text-xs text-[#7a706b] font-sans">SKU: {item.product?.sku} · Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-sans font-medium text-[#1a1614]">{formatCurrency(item.total_price)}</p>
                        <p className="text-xs text-[#7a706b] font-sans">{formatCurrency(item.unit_price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#e8e0d8] flex justify-between">
                  <span className="text-sm font-medium text-[#1a1614] font-sans">Total</span>
                  <span className="text-lg font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              {/* Tracking & notes */}
              <div className="bg-white border border-[#e8e0d8] p-6 space-y-5">
                <h2 className="text-sm font-light text-[#1a1614] pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Shipping & notes</h2>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Tracking number</label>
                  <input
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all"
                    placeholder="Enter courier tracking number"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">Notes to retailer</label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all"
                    placeholder="Any notes about this order..."
                  />
                </div>
                <button
                  onClick={saveTracking}
                  disabled={updating}
                  className="bg-[#6b2d4e] text-white px-6 py-2.5 text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors disabled:opacity-60"
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Retailer info */}
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Retailer</h3>
                <p className="text-sm text-[#1a1614] mb-1" style={{ fontFamily: 'Georgia, serif' }}>{(order.retailer as any)?.business_name}</p>
                <div className="flex items-center gap-1 text-xs text-[#7a706b] font-sans">
                  <MapPin size={11} /> {(order.retailer as any)?.city}, {(order.retailer as any)?.state}
                </div>
              </div>

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="bg-white border border-[#e8e0d8] p-6">
                  <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Ship to</h3>
                  <div className="text-sm text-[#7a706b] space-y-1 font-sans">
                    <p>{(order.shipping_address as any).name}</p>
                    <p>{(order.shipping_address as any).line1}</p>
                    {(order.shipping_address as any).line2 && <p>{(order.shipping_address as any).line2}</p>}
                    <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).state} {(order.shipping_address as any).pincode}</p>
                    {(order.shipping_address as any).phone && <p>{(order.shipping_address as any).phone}</p>}
                  </div>
                </div>
              )}

              {/* Payment terms */}
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Payment</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Order total', value: formatCurrency(order.total_amount) },
                    { label: 'Retailer pays by', value: order.payment_due_date ? formatDate(order.payment_due_date) : 'Pending' },
                    { label: 'Your payout', value: order.brand_payout_date ? formatDate(order.brand_payout_date) : 'Pending' },
                    { label: 'Payout status', value: order.brand_payout_status },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-[#7a706b] font-sans">{label}</span>
                      <span className="text-xs font-medium text-[#1a1614] font-sans capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Razorpay ref */}
              {order.razorpay_payment_id && (
                <div className="bg-[#faf8f5] border border-[#e8e0d8] p-4">
                  <p className="text-[0.6rem] font-sans tracking-widest uppercase text-[#7a706b] mb-1">Payment ID</p>
                  <p className="text-xs font-mono text-[#1a1614] break-all">{order.razorpay_payment_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
