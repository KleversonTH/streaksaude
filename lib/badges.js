export const BADGES = [
  { tipo: 'streak_7',   emoji: '🥉', nome: '7 dias seguidos',   dias: 7   },
  { tipo: 'streak_30',  emoji: '🥈', nome: '30 dias seguidos',  dias: 30  },
  { tipo: 'streak_100', emoji: '🏆', nome: '100 dias seguidos', dias: 100 },
]

export async function verificarEsalvarBadges(supabase, userId, habitoId, streak) {
  for (const badge of BADGES) {
    if (streak >= badge.dias) {
      await supabase.from('badges').upsert({
        user_id: userId,
        habit_id: habitoId,
        tipo: badge.tipo,
        conquistado_em: new Date().toISOString().split('T')[0],
      }, { onConflict: 'user_id,habit_id,tipo' })
    }
  }
}

export async function buscarBadges(supabase, userId) {
  const { data } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
  return data || []
}