'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function Dashboard() {
  const supabase = createClient()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    async function getUsuario() {
      const { data } = await supabase.auth.getUser()
      setUsuario(data.user)
    }
    getUsuario()
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
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-4xl mb-3">🔥</p>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Seus hábitos</h2>
          <p className="text-gray-500 text-sm mb-6">Você ainda não tem hábitos cadastrados.</p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition">
            + Adicionar hábito
          </button>
        </div>
      </div>
    </main>
  )
}