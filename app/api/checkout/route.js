import Stripe from 'stripe'
import { createClient } from '../../../lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/perfil?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/perfil?canceled=true`,
    metadata: { userId: user.id },
  })

  return Response.json({ url: session.url })
}