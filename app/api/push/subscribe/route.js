import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { subscription, userId, horario } = await req.json()

    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      subscription,
      horario: horario || '09:00',
    }, { onConflict: 'user_id' })

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}