'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [checkins, setCheckins] = useState({})

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUsuario(user)

      const { data: habitosData } = await supabase
        .from('habits')
        .select('*')
        .eq('active', true)
        .order('created_at')

      setHabitos(habitosData || [])

      if (habitosData?.length > 0) {
        const ids = habitosData.map(h => h.id)
        const { data: checkinsData } = await supabase
          .from('checkins')
          .select('*')
          .in('habit_id', ids)
          .eq('date', hoje)

        const mapa = {}
        checkinsData?.forEach(c => { mapa[c.habit_id] = true })
        setCheckins(mapa)
      }
    }
    carregar()
  }, [])

  async function toggleCheckin(habitoId) {
    if (checkins[habitoId]) return

    await supabase.from('checkins').insert({
      habit_id: habitoId,
      date: hoje,
      completed: true
    })

    setCheckins(prev => ({ ...prev, [habitoId]: true }))
  }

  const totalFeitos = Object.keys(checkins).length
  const totalHabitos = habitos.length

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-600">StreakSaúde</h1>
          {usuario && (
            <span className="text-sm text-gray-500">{usuario.email}</span>
          )}
        </div>

        {totalHabitos > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 mb-6 flex items-center gap-4">
            <div className="text-4xl">
              {totalFeitos === totalHabitos ? '🔥' : '⭕'}
            </div>
            <div>
              <p className="font-bold text-gray-800">
                {totalFeitos === totalHabitos
                  ? 'Tudo feito hoje!'
                  : `${totalFeitos} de ${totalHabitos} hábitos`}
              </p>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        )}

        {habitos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl mb-3">🔥</p>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Seus hábitos</h2>
            <p className="text-gray-500 text-sm mb-6">Você ainda não tem hábitos cadastrados.</p>
            <button
              onClick={() => router.push('/novo-habito')}
              className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition"
            >
              + Adicionar hábito
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habitos.map(habito => {
              const feito = checkins[habito.id]
              return (
                <button
                  key={habito.id}
                  onClick={() => toggleCheckin(habito.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl shadow transition ${
                    feito ? 'bg-green-600 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  <span className="text-3xl">{habito.icon}</span>
                  <span className="font-medium flex-1 text-left">{habito.name}</span>
                  <span className="text-2xl">{feito ? '✅' : '⬜'}</span>
                </button>
              )
            })}

            <button
              onClick={() => router.push('/novo-habito')}
              className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-2xl font-medium hover:border-green-400 hover:text-green-500 transition mt-2"
            >
              + Adicionar hábito
            </button>
          </div>
        )}

      </div>
    </main>
  )
}