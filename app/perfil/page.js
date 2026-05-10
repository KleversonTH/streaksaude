'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { calcularStreak } from '../../lib/streak'

export default function Perfil() {
  const supabase = createClient()
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [checkins, setCheckins] = useState([])

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUsuario(user)

      const { data: habitosData } = await supabase
        .from('habits')
        .select('*')
        .eq('active', true)

      setHabitos(habitosData || [])

      if (habitosData?.length > 0) {
        const ids = habitosData.map(h => h.id)
        const { data: checkinsData } = await supabase
          .from('checkins')
          .select('*')
          .in('habit_id', ids)
          .eq('completed', true)

        setCheckins(checkinsData || [])
      }
    }
    carregar()
  }, [])

  const totalCheckins = checkins.length

  const melhorStreak = habitos.reduce((max, h) => {
    const s = calcularStreak(checkins, h.id)
    return s > max ? s : max
  }, 0)

  const hoje = new Date().toISOString().split('T')[0]
  const habitosHoje = habitos.filter(h =>
    checkins.some(c => c.habit_id === h.id && c.date === hoje)
  ).length

  const diasAtivos = [...new Set(checkins.map(c => c.date))].length

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 mb-6 flex items-center gap-1 hover:text-gray-600"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu perfil</h1>

        {usuario && (
          <div className="bg-white rounded-2xl shadow p-6 mb-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              🧑
            </div>
            <div>
              <p className="font-bold text-gray-800">{usuario.user_metadata?.full_name || 'Usuário'}</p>
              <p className="text-sm text-gray-500">{usuario.email}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{habitos.length}</p>
            <p className="text-sm text-gray-500 mt-1">Hábitos ativos</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">{melhorStreak}🔥</p>
            <p className="text-sm text-gray-500 mt-1">Melhor streak</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{diasAtivos}</p>
            <p className="text-sm text-gray-500 mt-1">Dias ativos</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-purple-500">{totalCheckins}</p>
            <p className="text-sm text-gray-500 mt-1">Check-ins totais</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-gray-800 mb-3">Seus hábitos</h2>
          {habitos.map(h => (
            <div key={h.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{h.icon}</span>
                <span className="text-sm text-gray-700">{h.name}</span>
              </div>
              <span className="text-sm font-medium text-orange-500">
                🔥 {calcularStreak(checkins, h.id)} dias
              </span>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}