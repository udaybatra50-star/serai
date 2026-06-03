'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import type { Brand, Retailer } from '@/types'
import Navbar from '@/components/layout/Navbar'

interface CartData {
  brandId: string
  items: { product: { id: string; name: string; wholesale_price: number; images?: string[]; sku: string }; quantity: number }[]
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string; description: string;
  order_id: string; handler: (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill: { name: string; email: string; contact: string }; theme: { color: string }
}
interface RazorpayInstance { open: () => void }

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [retailer, setRetailer] = useState<Retailer | null>(null)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  const [shippingAddress, setShippingAddress] = useState({
    name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/signin')

      const { data: ret } = await supabase.from('retailers').select('*').eq('user_id', user.id).single()
      if (!ret) return router.push('/onboarding/retailer')
      setRetailer(ret)

      // Pre-fill address
      setShippingAddress({
        name: ret.business_name,
        line1: ret.address_line1 || '',
        line2: ret.address_line2 || '',
        city: ret.city || '',
        state: ret.state || '',
        pincode: ret.pincode || '',
        phone: '',
      })

      const brandId = searchParams.get('brand')
      if (brandId) {
        const { data: b } = await supabase.from('brands').select('*').eq('id', brandId).single()
        setBrand(b)
      }

      const stored = localStorage.getItem('serai_cart')
      if (stored) setCartData(JSON.parse(stored))

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>

  const subtotal = cartData?.items.reduce((s, i) => s + i.product.wholesale_price * i.quantity, 0) || 0
  const total = subtotal

  const paymentDueDate = new Date()
  paymentDueDate.setDate(paymentDueDate.getDate() + 30)

  const handlePlaceOrder = async () => {
    if (!retailer || !brand || !cartData) return
    setPlacing(true)
    setError('')

    try {
      // Create Razorpay order
      const rzpRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR', brandId: brand.id, retailerId: retailer.id }),
      })
      const rzpData = await rzpRes.json()
      if (!rzpRes.ok) throw new Error(rzpData.error || 'Failed to create payment order')

      // Open Razorpay
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: rzpData.amount,
        currency: 'INR',
        name: 'Serai',
        description: `Wholesale order — ${brand.name}`,
        order_id: rzpData.id,
        handler: async (response) => {
          // Confirm order in DB
          const confirmRes = await fetch('/api/orders/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: rzpData.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              brandId: brand.id,
              retailerId: retailer.id,
              items: cartData.items.map((i) => ({
                productId: i.product.id,
                quantity: i.quantity,
                unitPrice: i.product.wholesale_price,
              })),
              subtotal,
              totalAmount: total,
              shippingAddress,
            }),
          })
          const confirmData = await confirmRes.json()
          if (!confirmRes.ok) throw new Error(confirmData.error)

          localStorage.removeItem('serai_cart')
          setOrderId(confirmData.orderNumber)
          setSuccess(true)
          setPlacing(false)
        },
        prefill: {
          name: shippingAddress.name,
          email: '',
          contact: shippingAddress.phone,
        },
        theme: { color: '#6b2d4e' },
      })
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
      setPlacing(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-light text-[#1a1614] mb-3" style={{ fontFamily: 'Georgia, serif' }}>Order placed!</h1>
          <p className="text-[#7a706b] mb-2 font-sans">Order #{orderId}</p>
          <p className="text-[#7a706b] text-sm leading-relaxed mb-8" style={{ fontFamily: 'Georgia, serif' }}>
            Your wholesale order has been confirmed. Payment is due by <strong>{formatDate(paymentDueDate.toISOString())}</strong> (Net-30 terms).
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/retailer/orders" className="bg-[#6b2d4e] text-white py-3 text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors">
              View Orders
            </Link>
            <Link href="/retailer/browse" className="border border-[#e8e0d8] text-[#7a706b] py-3 text-sm tracking-[0.1em] uppercase font-sans hover:border-[#1a1614] hover:text-[#1a1614] transition-colors">
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar variant="solid" userRole="retailer" />
      <div className="pt-20 lg:pt-24">
        {/* Razorpay SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />

        <div className="container-editorial py-10 max-w-5xl">
          <Link href="javascript:history.back()" className="inline-flex items-center gap-2 text-xs text-[#7a706b] hover:text-[#1a1614] font-sans tracking-wide mb-8 transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>

          <p className="section-label mb-2">Checkout</p>
          <h1 className="text-3xl font-light text-[#1a1614] mb-10" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
            Review & place order
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order items */}
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h2 className="text-base font-light text-[#1a1614] mb-5 pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>
                  Order from {brand?.name}
                </h2>
                <div className="space-y-4">
                  {cartData?.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 py-3 border-b border-[#f2ede6] last:border-0">
                      <div className="w-14 h-14 bg-[#f5e8ef] shrink-0">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg text-[#c47fa0]" style={{ fontFamily: 'Georgia, serif' }}>{item.product.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{item.product.name}</p>
                        <p className="text-xs text-[#7a706b] font-sans">SKU: {item.product.sku} · Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-sans text-[#1a1614]">{formatCurrency(item.product.wholesale_price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h2 className="text-base font-light text-[#1a1614] mb-5 pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Shipping address</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Business name', full: true },
                    { key: 'line1', label: 'Address line 1', full: true },
                    { key: 'line2', label: 'Address line 2 (optional)', full: true },
                    { key: 'city', label: 'City' },
                    { key: 'pincode', label: 'PIN code' },
                    { key: 'state', label: 'State' },
                    { key: 'phone', label: 'Contact phone' },
                  ].map(({ key, label, full }) => (
                    <div key={key} className={full ? 'col-span-2' : ''}>
                      <label className="block text-[0.65rem] font-medium tracking-[0.15em] uppercase text-[#7a706b] mb-2 font-sans">{label}</label>
                      <input
                        value={shippingAddress[key as keyof typeof shippingAddress]}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, [key]: e.target.value })}
                        className="w-full px-4 py-3 border border-[#e8e0d8] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6b2d4e] transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — summary */}
            <div className="space-y-5">
              <div className="bg-white border border-[#e8e0d8] p-6">
                <h2 className="text-base font-light text-[#1a1614] mb-5 pb-4 border-b border-[#f2ede6]" style={{ fontFamily: 'Georgia, serif' }}>Order summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7a706b] font-sans">{cartData?.items.length} items</span>
                    <span className="text-[#1a1614] font-sans">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7a706b] font-sans">Shipping</span>
                    <span className="text-[#7a706b] font-sans text-xs italic">Calculated by brand</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-[#e8e0d8]">
                    <span className="text-sm font-medium text-[#1a1614] font-sans">Total</span>
                    <span className="text-lg font-light text-[#1a1614]" style={{ fontFamily: 'Georgia, serif' }}>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="mt-4 bg-[#f5e8ef] px-4 py-3 border border-[#d4a0b8]">
                  <p className="text-xs text-[#6b2d4e] font-sans leading-relaxed">
                    <strong>Net-30 payment terms:</strong> Payment due by{' '}
                    <strong>{formatDate(paymentDueDate.toISOString())}</strong>
                  </p>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 px-4 py-3">
                    <p className="text-xs text-red-700 font-sans">{error}</p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !cartData?.items.length}
                  className="w-full mt-5 py-4 bg-[#6b2d4e] text-white text-sm tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <>Confirm & Pay</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <Shield size={12} className="text-[#7a706b]" />
                  <p className="text-[0.6rem] text-[#7a706b] font-sans">Secured by Razorpay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6b2d4e] border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
