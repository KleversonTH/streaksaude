'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { calcularStreak } from '../../lib/streak'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [checkins, setCheckins] = useState({})
  const [todosCheckins, setTodosCheckins] = useState([])
  const [celebrando, setCelebrando] = useState(null)

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUsuario(user)

      const { data: habitosData } = await supabase
        .from('habits').select('*').eq('active', true).order('created_at')
      setHabitos(habitosData || [])

      if (habitosData?.length > 0) {
        const ids = habitosData.map(h => h.id)
        const { data: checkinsHoje } = await supabase
          .from('checkins').select('*').in('habit_id', ids).eq('date', hoje)
        const mapa = {}
        checkinsHoje?.forEach(c => { mapa[c.habit_id] = true })
        setCheckins(mapa)

        const { data: todosData } = await supabase
          .from('checkins').select('*').in('habit_id', ids).eq('completed', true)
        setTodosCheckins(todosData || [])
      }
    }
    carregar()
  }, [])

  async function toggleCheckin(habitoId) {
    if (checkins[habitoId]) return
    await supabase.from('checkins').insert({ habit_id: habitoId, date: hoje, completed: true })
    const novoCheckin = { habit_id: habitoId, date: hoje, completed: true }
    setCheckins(prev => ({ ...prev, [habitoId]: true }))
    setTodosCheckins(prev => [...prev, novoCheckin])
    setCelebrando(habitoId)
    setTimeout(() => setCelebrando(null), 1000)
  }

  async function deletarHabito(habitoId) {
    const confirmar = window.confirm('Deletar esse hábito? O histórico será perdido.')
    if (!confirmar) return
    await supabase.from('checkins').delete().eq('habit_id', habitoId)
    await supabase.from('habits').delete().eq('id', habitoId)
    setHabitos(prev => prev.filter(h => h.id !== habitoId))
    setTodosCheckins(prev => prev.filter(c => c.habit_id !== habitoId))
  }

  const totalFeitos = Object.keys(checkins).length
  const totalHabitos = habitos.length

  const card = (feito) => ({
    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
    borderRadius: '20px', marginBottom: '12px', cursor: 'pointer',
    border: 'none', width: '100%', textAlign: 'left', transition: 'all 0.2s',
    background: feito ? 'rgba(16,185,129,0.85)' : 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: feito ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
  })

  return (
    <main style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>StreakSaúde</span>
          </div>
          {usuario && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => router.push('/perfil')}
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {usuario.email}
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
                style={{ fontSize: '13px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Progresso do dia */}
        {totalHabitos > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', padding: '20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <span style={{ fontSize: '40px' }}>{totalFeitos === totalHabitos ? '🔥' : '⭕'}</span>
            <div>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>
                {totalFeitos === totalHabitos ? 'Tudo feito hoje!' : `${totalFeitos} de ${totalHabitos} hábitos`}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button onClick={() => router.push('/historico')}
              style={{ marginLeft: 'auto', fontSize: '12px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>
              Histórico →
            </button>
          </div>
        )}

        {/* Hábitos */}
        {habitos.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px', padding: '40px 24px', textAlign: 'center'
          }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</p>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Seus hábitos</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>Você ainda não tem hábitos cadastrados.</p>
            <button onClick={() => router.push('/novo-habito')} style={{
              background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
              border: 'none', borderRadius: '99px', padding: '12px 28px',
              fontWeight: '600', cursor: 'pointer', fontSize: '15px'
            }}>
              + Adicionar hábito
            </button>
          </div>
        ) : (
          <div>
            {habitos.map(habito => {
              const feito = checkins[habito.id]
              const streak = calcularStreak(todosCheckins, habito.id)
              return (
                <div key={habito.id} style={{ ...card(feito), justifyContent: 'space-between' }}>
                  <button onClick={() => toggleCheckin(habito.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '32px' }}>{habito.icon}</span>
                    <div>
                      <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: '0 0 2px' }}>{habito.name}</p>
                      {streak > 0 && (
                        <p style={{ color: feito ? 'rgba(255,255,255,0.7)' : '#f97316', fontSize: '12px', margin: 0 }}>
                          🔥 {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
                        </p>
                      )}
                    </div>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '24px',
                      transition: 'transform 0.3s',
                      transform: celebrando === habito.id ? 'scale(1.5)' : 'scale(1)',
                      display: 'inline-block'
                    }}>
                      {feito ? '✅' : '⬜'}
                    </span>
                    <button onClick={() => deletarHabito(habito.id)}
                      style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}

            <button onClick={() => router.push('/novo-habito')} style={{
              width: '100%', padding: '16px', borderRadius: '20px', marginTop: '4px',
              background: 'transparent', border: '2px dashed rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.4)', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              + Adicionar hábito
            </button>
          </div>
        )}

      </div>
    </main>
  )
}