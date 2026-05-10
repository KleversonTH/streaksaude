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
        .from('habits').select('*').eq('active', true).order('created_at')
      setHabitos(habitosData || [])

      if (habitosData?.length > 0) {
        const ids = habitosData.map(h => h.id)
        const { data: checkinsData } = await supabase
          .from('checkins').select('*').in('habit_id', ids).gte('date', dias[0]).eq('completed', true)
        setCheckins(checkinsData || [])
      }
    }
    carregar()
  }, [])

  function feito(habitoId, data) {
    return checkins.some(c => c.habit_id === habitoId && c.date === data)
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
          Últimos 7 dias
        </h1>

        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px', overflow: 'hidden'
        }}>

          {/* Header dos dias */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ padding: '12px' }} />
            {dias.map(dia => (
              <div key={dia} style={{ padding: '12px 4px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 2px' }}>{nomeDia(dia)}</p>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: 0 }}>{numeroDia(dia)}</p>
              </div>
            ))}
          </div>

          {/* Linhas de hábitos */}
          {habitos.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Nenhum hábito cadastrado ainda.
            </div>
          ) : (
            habitos.map((habito, idx) => (
              <div key={habito.id} style={{
                display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)',
                borderBottom: idx < habitos.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
              }}>
                <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {habito.icon}
                </div>
                {dias.map(dia => (
                  <div key={dia} style={{ padding: '12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: '600',
                      background: feito(habito.id, dia) ? 'rgba(16,185,129,0.85)' : 'rgba(255,255,255,0.06)',
                      color: feito(habito.id, dia) ? 'white' : 'rgba(255,255,255,0.2)',
                      border: feito(habito.id, dia) ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)'
                    }}>
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