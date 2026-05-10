'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

const icones = ['💧', '🏃', '😴', '🥗', '📚', '🧘', '💊', '🚴', '✍️', '🎯']

export default function NovoHabito() {
  const supabase = createClient()
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('💧')
  const [horario, setHorario] = useState('08:00')
  const [salvando, setSalvando] = useState(false)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    async function getUsuario() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUsuario(user)
    }
    getUsuario()
  }, [])

  async function salvarHabito() {
    if (!nome.trim() || !usuario) return
    setSalvando(true)

    await supabase.from('habits').insert({
      user_id: usuario.id,
      name: nome,
      icon: icone,
      reminder_time: horario
    })

    router.push('/dashboard')
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

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo hábito</h1>

        <div className="bg-white rounded-2xl shadow p-6 space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do hábito</label>
            <input
              type="text"
              placeholder="Ex: Beber 2L de água"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
            <div className="grid grid-cols-5 gap-2">
              {icones.map(i => (
                <button
                  key={i}
                  onClick={() => setIcone(i)}
                  className={`text-2xl p-2 rounded-xl border-2 transition ${icone === i ? 'border-green-500 bg-green-50' : 'border-transparent hover:bg-gray-50'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horário do lembrete</label>
            <input
              type="time"
              value={horario}
              onChange={e => setHorario(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={salvarHabito}
            disabled={salvando || !nome.trim()}
            className="w-full bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar hábito'}
          </button>

        </div>
      </div>
    </main>
  )
}