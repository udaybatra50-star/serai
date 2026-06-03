import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      brandId,
      retailerId,
      items,
      subtotal,
      totalAmount,
      shippingAddress,
    } = await req.json()

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => {
            try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    // Get brand payment terms
    const { data: brand } = await supabase
      .from('brands')
      .select('payment_terms_days, brand_payout_days')
      .eq('id', brandId)
      .single()

    const paymentDue = new Date()
    paymentDue.setDate(paymentDue.getDate() + (brand?.payment_terms_days || 30))

    const payoutDate = new Date()
    payoutDate.setDate(payoutDate.getDate() + (brand?.brand_payout_days || 7))

    // Create order (order_number set by trigger)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        retailer_id: retailerId,
        brand_id: brandId,
        status: 'confirmed',
        payment_status: 'authorized',
        subtotal,
        total_amount: totalAmount,
        discount_amount: 0,
        shipping_amount: 0,
        payment_due_date: paymentDue.toISOString().split('T')[0],
        brand_payout_date: payoutDate.toISOString().split('T')[0],
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Record payment transaction
    await supabase.from('payment_transactions').insert({
      order_id: order.id,
      type: 'retailer_payment',
      amount: totalAmount,
      currency: 'INR',
      status: 'completed',
      razorpay_payment_id: razorpayPaymentId,
    })

    return NextResponse.json({ orderId: order.id, orderNumber: order.order_number })
  } catch (err: unknown) {
    console.error('Order confirmation failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to confirm order' },
      { status: 500 }
    )
  }
}
