'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { calcularStreak } from '../../lib/streak'
import { buscarBadges, BADGES } from '../../lib/badges'

export default function Perfil() {
  const supabase = createClient()
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [checkins, setCheckins] = useState([])
  const [badges, setBadges] = useState([])
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUsuario(user)

      const { data: perfil } = await supabase
        .from('profiles').select('premium').eq('id', user.id).single()
      setPremium(perfil?.premium || false)

      const { data: habitosData } = await supabase
        .from('habits').select('*').eq('active', true)
      setHabitos(habitosData || [])

      if (habitosData?.length > 0) {
        const ids = habitosData.map(h => h.id)
        const { data: checkinsData } = await supabase
          .from('checkins').select('*').in('habit_id', ids).eq('completed', true)
        setCheckins(checkinsData || [])
      }

      const badgesData = await buscarBadges(supabase, user.id)
      setBadges(badgesData)
    }
    carregar()
  }, [])

  const totalCheckins = checkins.length
  const melhorStreak = habitos.reduce((max, h) => {
    const s = calcularStreak(checkins, h.id)
    return s > max ? s : max
  }, 0)
  const diasAtivos = [...new Set(checkins.map(c => c.date))].length

  const statStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '20px', textAlign: 'center'
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
              fontSize: '24px'
            }}>
              🧑
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                  {usuario.user_metadata?.full_name || 'Usuário'}
                </p>
                {premium && (
                  <span style={{
                    fontSize: '11px', fontWeight: '700',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white', borderRadius: '99px', padding: '2px 8px'
                  }}>PRO</span>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                {usuario.email}
              </p>
            </div>
          </div>
        )}

        {/* Banner premium / upgrade */}
        {!premium ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))',
            border: '1px solid rgba(245,158,11,0.25)', borderRadius: '20px',
            padding: '20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
          }}>
            <div>
              <p style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px', margin: '0 0 4px' }}>
                ⭐ Upgrade para Premium
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
                Hábitos ilimitados + gráfico semanal + badges exclusivos
              </p>
            </div>
            <button
              onClick={async () => {
                // Simula ativação premium (substituir por Stripe futuramente)
                await supabase.from('profiles').upsert({ id: usuario.id, premium: true })
                setPremium(true)
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', border: 'none', borderRadius: '99px',
                padding: '10px 20px', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}>
              Ativar →
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '20px', padding: '16px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <div>
              <p style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px', margin: '0 0 2px' }}>Plano Premium ativo</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Hábitos ilimitados, gráfico semanal e badges desbloqueados</p>
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

        {/* Conquistas */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px', padding: '24px', marginBottom: '16px'
        }}>
          <h2 style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '0 0 16px' }}>
            🏅 Conquistas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {BADGES.map(b => {
              const conquistado = badges.find(bg => bg.tipo === b.tipo)
              return (
                <div key={b.tipo} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: '14px',
                  background: conquistado ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                  border: conquistado ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  opacity: conquistado ? 1 : 0.5
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{b.emoji}</span>
                    <div>
                      <p style={{ color: conquistado ? '#f59e0b' : 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '14px', margin: '0 0 2px' }}>
                        {b.nome}
                      </p>
                      {conquistado && (
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                          Conquistado em {new Date(conquistado.conquistado_em + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  {conquistado
                    ? <span style={{ fontSize: '16px' }}>✅</span>
                    : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>🔒</span>
                  }
                </div>
              )
            })}
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