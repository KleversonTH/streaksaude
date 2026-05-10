'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)

      const { data } = await supabase
        .from('habits')
        .select('*')
        .eq('active', true)
        .order('created_at')

      setHabitos(data || [])
    }
    carregar()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-green-600">StreakSaúde</h1>
          {usuario && (
            <span className="text-sm text-gray-500">{usuario.email}</span>
          )}
        </div>

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
            {habitos.map(habito => (
              <div key={habito.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
                <span className="text-3xl">{habito.icon}</span>
                <span className="font-medium text-gray-800">{habito.name}</span>
              </div>
            ))}
            <button
              onClick={() => router.push('/novo-habito')}
              className="w-full bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition mt-4"
            >
              + Adicionar hábito
            </button>
          </div>
        )}
      </div>
    </main>
  )
}