import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret || keyId.startsWith('your_')) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const { amount, currency = 'INR', brandId, retailerId } = await req.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      notes: { brand_id: brandId, retailer_id: retailerId },
    })

    return NextResponse.json(order)
  } catch (err: unknown) {
    console.error('Razorpay order creation failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
