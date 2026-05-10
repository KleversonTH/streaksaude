'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

function ultimosDias(n) {
  const dias = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dias.push(d.toISOString().split('T')[0])
  }
  return dias
}

function nomeDia(data) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })
}

function numeroDia(data) {
  return new Date(data + 'T12:00:00').getDate()
}

export default function Historico() {
  const supabase = createClient()
  const router = useRouter()
  const [habitos, setHabitos] = useState([])
  const [checkins, setCheckins] = useState([])

  const dias = ultimosDias(7)

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

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
          .gte('date', dias[0])
          .eq('completed', true)

        setCheckins(checkinsData || [])
      }
    }
    carregar()
  }, [])

  function feito(habitoId, data) {
    return checkins.some(c => c.habit_id === habitoId && c.date === data)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 mb-6 flex items-center gap-1 hover:text-gray-600"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Últimos 7 dias</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-3"></div>
            {dias.map(dia => (
              <div key={dia} className="p-2 text-center">
                <p className="text-xs text-gray-400">{nomeDia(dia)}</p>
                <p className="text-sm font-medium text-gray-700">{numeroDia(dia)}</p>
              </div>
            ))}
          </div>

          {habitos.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Nenhum hábito cadastrado ainda.
            </div>
          ) : (
            habitos.map(habito => (
              <div key={habito.id} className="grid grid-cols-8 border-b border-gray-50 last:border-0">
                <div className="p-3 flex items-center gap-2">
                  <span className="text-xl">{habito.icon}</span>
                </div>
                {dias.map(dia => (
                  <div key={dia} className="p-2 flex items-center justify-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      feito(habito.id, dia)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-300'
                    }`}>
                      {feito(habito.id, dia) ? '✓' : '·'}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  )
}