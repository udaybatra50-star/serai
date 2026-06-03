import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify webhook signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSig !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
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

  switch (event.event) {
    case 'payment.captured': {
      const payment = event.payload.payment.entity
      await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('razorpay_payment_id', payment.id)

      await supabase
        .from('payment_transactions')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('razorpay_payment_id', payment.id)
      break
    }

    case 'payment.failed': {
      const payment = event.payload.payment.entity
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('razorpay_payment_id', payment.id)
      break
    }

    case 'refund.created': {
      const refund = event.payload.refund.entity
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('order_id')
        .eq('razorpay_payment_id', refund.payment_id)
        .single()

      if (transaction) {
        await supabase.from('payment_transactions').insert({
          order_id: transaction.order_id,
          type: 'refund',
          amount: refund.amount / 100,
          currency: refund.currency,
          status: 'completed',
          razorpay_payment_id: refund.payment_id,
          processed_at: new Date().toISOString(),
        })

        await supabase
          .from('orders')
          .update({ payment_status: 'refunded', status: 'cancelled' })
          .eq('id', transaction.order_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
