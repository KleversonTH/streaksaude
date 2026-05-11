import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return Response.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, premium: true })
    }
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice_payment.paid') {
    const invoice = event.data.object
    const customerId = invoice.customer

    const customers = await stripe.customers.list({ email: invoice.customer_email, limit: 1 })
    if (customers.data.length > 0) {
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId, limit: 5
      })
      for (const session of sessions.data) {
        if (session.metadata?.userId) {
          await supabase.from('profiles').upsert({ id: session.metadata.userId, premium: true })
          break
        }
      }
    }
  }

  return Response.json({ received: true })
}