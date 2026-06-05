'use client'
// comentário edit 06

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
      if (!user) { router.push('/login'); return }
      setUsuario(user)
    }
    getUsuario()
  }, [])

  async function salvarHabito() {
    if (!nome.trim() || !usuario) return
    setSalvando(true)
    await supabase.from('habits').insert({
      user_id: usuario.id, name: nome, icon: icone, reminder_time: horario
    })
    router.push('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <button onClick={() => router.push('/dashboard')} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          ← Voltar
        </button>

        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
          Novo hábito
        </h1>

        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px', padding: '32px'
        }}>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              Nome do hábito
            </label>
            <input
              type="text"
              placeholder="Ex: Beber 2L de água"
              value={nome}
              onChange={e => setNome(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              Ícone
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {icones.map(i => (
                <button key={i} onClick={() => setIcone(i)} style={{
                  fontSize: '24px', padding: '12px', borderRadius: '16px', cursor: 'pointer',
                  background: icone === i ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                  border: icone === i ? '2px solid #10b981' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
              Horário do lembrete
            </label>
            <input
              type="time"
              value={horario}
              onChange={e => setHorario(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <button onClick={salvarHabito} disabled={salvando || !nome.trim()} style={{
            width: '100%', padding: '16px', borderRadius: '99px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            opacity: salvando || !nome.trim() ? 0.5 : 1,
            boxShadow: '0 4px 20px rgba(16,185,129,0.4)'
          }}>
            {salvando ? 'Salvando...' : 'Salvar hábito'}
          </button>

        </div>
      </div>
    </main>
  )
}