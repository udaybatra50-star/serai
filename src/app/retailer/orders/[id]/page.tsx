'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, Truck, AlertCircle, CheckCircle, Shield } from 'lucide-react'
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

export default function RetailerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [payingNow, setPayingNow] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/signin')

      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          brand:brands(name, logo_url, origin_city),
          retailer:retailers(business_name),
          items:order_items(*, product:products(name, sku, images))
        `)
        .eq('id', id)
        .single()

      if (!data) return router.push('/retailer/orders')
      setOrder(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handlePayNow = async () => {
    if (!order) return
    setPayingNow(true)

    try {
      const rzpRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: order.total_amount, currency: 'INR', brandId: order.brand_id, retailerId: order.retailer_id }),
      })
      const rzpData = await rzpRes.json()

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpData.amount,
        currency: 'INR',
        name: 'Serai',
        description: `Payment for ${order.order_number}`,
        order_id: rzpData.id,
        handler: async (response: any) => {
          await supabase.from('orders').update({
            payment_status: 'paid',
            razorpay_payment_id: response.razorpay_payment_id,
          }).eq('id', order.id)

          setOrder((prev) => prev ? { ...prev, payment_status: 'paid' } : prev)
          setPayingNow(false)
        },
        prefill: {},
        theme: { color: '#6b2d4e' },
      })
      rzp.open()
    } catch {
      setPayingNow(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!order) return null

  const currentStatusIndex = ORDER_STATUSES.indexOf(order.status)
  const isOverdue = order.payment_status === 'overdue'
  const canPayNow = ['pending', 'authorized', 'overdue'].includes(order.payment_status) && order.status !== 'cancelled'

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="retailer" />
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="pt-20 lg:pt-24">
        <div className="container-editorial py-10 max-w-5xl">
          <Link href="/retailer/orders" className="inline-flex items-center gap-2 text-xs text-[#7a706b] hover:text-[#1a1614] font-sans tracking-wide mb-8 transition-colors">
            <ArrowLeft size={14} /> All orders
          </Link>

          {/* Overdue alert */}
          {isOverdue && (
            <div className="bg-red-50 border border-red-300 px-5 py-4 mb-6 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 font-sans">Payment overdue</p>
                <p className="text-xs text-red-700 font-sans mt-0.5">
                  This order was due on {order.payment_due_date ? formatDate(order.payment_due_date) : '—'}. Please pay immediately to avoid account suspension.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="section-label mb-2">Order Detail</p>
              <h1 className="text-3xl font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
                {order.order_number}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[#7a706b] font-sans">{formatDate(order.created_at)}</span>
                <span className="text-[#e8e0d8]">·</span>
                <span className="text-sm text-[#7a706b] font-sans">{(order.brand as any)?.name}</span>
              </div>
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
            <h2 className="text-sm font-light text-[#1a1614] mb-5" style={{ fontFamily: 'Georgia, serif' }}>Shipment Status</h2>
            <div className="flex items-center">
              {ORDER_STATUSES.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 flex items-center justify-center text-xs ${i <= currentStatusIndex ? 'bg-[#6b2d4e] text-white' : 'bg-[#e8e0d8] text-[#7a706b]'}`}>
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

            {order.tracking_number && (
              <div className="mt-5 pt-5 border-t border-[#f2ede6] flex items-center gap-3">
                <Truck size={16} className="text-[#6b2d4e]" />
                <div>
                  <p className="text-xs text-[#7a706b] font-sans">Tracking number</p>
                  <p className="text-sm font-mono text-[#1a1614]">{order.tracking_number}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h2 className="text-sm font-light text-[#1a1614] mb-5 pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Items</h2>
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

              {/* Retailer notes from brand */}
              {order.brand_notes && (
                <div className="bg-white border border-[#e8e0d8] p-6">
                  <h2 className="text-sm font-light text-[#1a1614] mb-3" style={{ fontFamily: 'Georgia, serif' }}>Note from brand</h2>
                  <p className="text-sm text-[#7a706b] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>{order.brand_notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Payment action */}
              <div className={`border p-6 ${isOverdue ? 'bg-red-50 border-red-300' : 'bg-white border-[#e8e0d8]'}`}>
                <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Payment</h3>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between">
                    <span className="text-xs text-[#7a706b] font-sans">Amount</span>
                    <span className="text-sm font-medium text-[#1a1614] font-sans">{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#7a706b] font-sans">Due by</span>
                    <span className={`text-xs font-sans ${isOverdue ? 'text-red-600 font-semibold' : 'text-[#1a1614]'}`}>
                      {order.payment_due_date ? formatDate(order.payment_due_date) : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#7a706b] font-sans">Status</span>
                    <span className={`text-xs font-sans capitalize ${isOverdue ? 'text-red-600 font-semibold' : 'text-[#1a1614]'}`}>{order.payment_status}</span>
                  </div>
                </div>

                {order.payment_status === 'paid' && (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3">
                    <CheckCircle size={16} />
                    <span className="text-xs font-sans">Payment complete</span>
                  </div>
                )}

                {canPayNow && (
                  <button
                    onClick={handlePayNow}
                    disabled={payingNow}
                    className={`w-full py-3 text-white text-xs tracking-[0.1em] uppercase font-sans transition-colors disabled:opacity-60 ${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-[#6b2d4e] hover:bg-[#521f3c]'}`}
                  >
                    {payingNow ? 'Opening payment...' : isOverdue ? 'Pay now (overdue)' : 'Pay now'}
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Shield size={11} className="text-[#b8b0a8]" />
                  <p className="text-[0.6rem] text-[#b8b0a8] font-sans">Secured by Razorpay</p>
                </div>
              </div>

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="bg-white border border-[#e8e0d8] p-6">
                  <h3 className="text-sm font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Shipped to</h3>
                  <div className="text-xs text-[#7a706b] space-y-1 font-sans">
                    <p className="font-medium text-[#1a1614]">{(order.shipping_address as any).name}</p>
                    <p>{(order.shipping_address as any).line1}</p>
                    {(order.shipping_address as any).line2 && <p>{(order.shipping_address as any).line2}</p>}
                    <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).state} {(order.shipping_address as any).pincode}</p>
                    {(order.shipping_address as any).phone && <p>{(order.shipping_address as any).phone}</p>}
                  </div>
                </div>
              )}

              {/* Razorpay ref */}
              {order.razorpay_payment_id && (
                <div className="bg-[#faf8f5] border border-[#e8e0d8] p-4">
                  <p className="text-[0.6rem] font-sans tracking-widest uppercase text-[#7a706b] mb-1">Payment reference</p>
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
