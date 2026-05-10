export function calcularStreak(checkins, habitoId) {
  const datas = checkins
    .filter(c => c.habit_id === habitoId && c.completed)
    .map(c => c.date)
    .sort()
    .reverse()

  if (datas.length === 0) return 0

  let streak = 0
  let dataAtual = new Date()

  for (let i = 0; i < datas.length; i++) {
    const dataCheckin = new Date(datas[i] + 'T12:00:00')
    const diffDias = Math.round((dataAtual - dataCheckin) / (1000 * 60 * 60 * 24))

    if (diffDias === 0 || diffDias === 1) {
      streak++
      dataAtual = dataCheckin
    } else {
      break
    }
  }

  return streak
}