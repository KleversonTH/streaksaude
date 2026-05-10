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
        .from('habits').select('*').eq('active', true)
      setHabitos(habitosData || [])

      if (habitosData?.length > 0) {
        const ids = habitosData.map(h => h.id)
        const { data: checkinsData } = await supabase
          .from('checkins').select('*').in('habit_id', ids).eq('completed', true)
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
  const diasAtivos = [...new Set(checkins.map(c => c.date))].length

  const statStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '20px',
    textAlign: 'center'
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
          Meu perfil
        </h1>

        {/* Card do usuário */}
        {usuario && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', padding: '24px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
            }}>
              🧑
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>
                {usuario.user_metadata?.full_name || 'Usuário'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                {usuario.email}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={statStyle}>
            <p style={{ color: '#10b981', fontSize: '32px', fontWeight: '700', margin: '0 0 4px' }}>{habitos.length}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>Hábitos ativos</p>
          </div>
          <div style={statStyle}>
            <p style={{ color: '#f97316', fontSize: '32px', fontWeight: '700', margin: '0 0 4px' }}>{melhorStreak}🔥</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>Melhor streak</p>
          </div>
          <div style={statStyle}>
            <p style={{ color: '#60a5fa', fontSize: '32px', fontWeight: '700', margin: '0 0 4px' }}>{diasAtivos}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>Dias ativos</p>
          </div>
          <div style={statStyle}>
            <p style={{ color: '#a78bfa', fontSize: '32px', fontWeight: '700', margin: '0 0 4px' }}>{totalCheckins}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>Check-ins totais</p>
          </div>
        </div>

        {/* Lista de hábitos */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px', padding: '24px'
        }}>
          <h2 style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '0 0 16px' }}>Seus hábitos</h2>
          {habitos.map((h, idx) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: idx < habitos.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{h.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{h.name}</span>
              </div>
              <span style={{ color: '#f97316', fontSize: '13px', fontWeight: '600' }}>
                🔥 {calcularStreak(checkins, h.id)} dias
              </span>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}