import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(req) {
  try {
    const agora = new Date()
    const horarioAtual = agora.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('horario', horarioAtual)

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({ sent: 0 })
    }

    const payload = JSON.stringify({
      title: '🔥 StreakSaúde',
      body: 'Não esqueça de registrar seus hábitos hoje!',
      url: '/dashboard',
    })

    const results = await Promise.allSettled(
      subscriptions.map(({ subscription }) =>
        webpush.sendNotification(subscription, payload)
      )
    )

    return Response.json({ sent: results.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}