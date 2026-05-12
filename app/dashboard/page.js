'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import { calcularStreak } from '../../lib/streak'
import { verificarEsalvarBadges, buscarBadges, BADGES } from '../../lib/badges'
const confetti = typeof window !== 'undefined' ? require('canvas-confetti') : null

const LIMITE_FREE = 3

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [checkins, setCheckins] = useState({})
  const [todosCheckins, setTodosCheckins] = useState([])
  const [celebrando, setCelebrando] = useState(null)
  const [badges, setBadges] = useState([])
  const [badgeNovo, setBadgeNovo] = useState(null)
  const [premium, setPremium] = useState(false)
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false)

  async function ativarNotificacoes() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Seu navegador não suporta notificações push.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, userId: usuario.id }),
    })

    setNotificacaoAtiva(true)
  }
  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUsuario(user)

      const { data: perfil } = await supabase
        .from('profiles').select('premium').eq('id', user.id).maybeSingle()
      setPremium(perfil?.premium || false)

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

      const badgesData = await buscarBadges(supabase, user.id)
      setBadges(badgesData)
    }
    carregar()
  }, [])

  async function toggleCheckin(habitoId) {
    if (checkins[habitoId]) return
    await supabase.from('checkins').insert({ habit_id: habitoId, date: hoje, completed: true })
    const novoCheckin = { habit_id: habitoId, date: hoje, completed: true }
    const novosCheckins = [...todosCheckins, novoCheckin]
    setCheckins(prev => ({ ...prev, [habitoId]: true }))
    setTodosCheckins(novosCheckins)
    setCelebrando(habitoId)
    setTimeout(() => setCelebrando(null), 1000)
    const totalFeitosAgora = Object.keys({ ...checkins, [habitoId]: true }).length
    if (totalFeitosAgora === totalHabitos && confetti) {
      confetti.default({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#60a5fa', '#f97316', '#a78bfa']
      })
    }
    const streak = calcularStreak(novosCheckins, habitoId)
    const badgesAntes = badges.map(b => b.tipo)
    await verificarEsalvarBadges(supabase, usuario.id, habitoId, streak)
    const badgesDepois = await buscarBadges(supabase, usuario.id)
    setBadges(badgesDepois)

    const novo = badgesDepois.find(b =>
      b.habit_id === habitoId && !badgesAntes.includes(b.tipo)
    )
    if (novo) {
      const info = BADGES.find(b => b.tipo === novo.tipo)
      setBadgeNovo(info)
      setTimeout(() => setBadgeNovo(null), 3000)
    }
  }

  async function deletarHabito(habitoId) {
    const confirmar = window.confirm('Deletar esse hábito? O histórico será perdido.')
    if (!confirmar) return
    await supabase.from('checkins').delete().eq('habit_id', habitoId)
    await supabase.from('habits').delete().eq('id', habitoId)
    setHabitos(prev => prev.filter(h => h.id !== habitoId))
    setTodosCheckins(prev => prev.filter(c => c.habit_id !== habitoId))
  }

  function podeCriarHabito() {
    if (premium) return true
    return habitos.length < LIMITE_FREE
  }

  const totalFeitos = Object.keys(checkins).length
  const totalHabitos = habitos.length

  const card = (feito) => ({
    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
    borderRadius: '20px', marginBottom: '12px', cursor: 'pointer',
    border: 'none', width: '100%', textAlign: 'left', transition: 'all 0.2s',
    background: feito ? 'rgba(16,185,129,0.85)' : 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    borderTop: feito ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
  })

  return (
    <main style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Notificação de badge novo */}
        {badgeNovo && (
          <div style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white', borderRadius: '99px', padding: '12px 24px',
            fontWeight: '700', fontSize: '15px', zIndex: 1000,
            boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
            animation: 'slideDown 0.4s ease'
          }}>
            {badgeNovo.emoji} Conquista desbloqueada: {badgeNovo.nome}!
          </div>
        )}

        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>StreakSaúde</span>
            {premium && (
              <span style={{
                fontSize: '11px', fontWeight: '700', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', borderRadius: '99px', padding: '2px 8px', marginLeft: '4px'
              }}>PRO</span>
            )}
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

        {/* Banner premium se free e tem 3+ hábitos */}
        {!premium && habitos.length >= LIMITE_FREE && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))',
            border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px',
            padding: '16px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px', margin: '0 0 2px' }}>
                🔒 Limite atingido
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
                Plano free: até {LIMITE_FREE} hábitos
              </p>
            </div>
            <button onClick={() => router.push('/perfil')} style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white', border: 'none', borderRadius: '99px',
              padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}>
              Upgrade →
            </button>
          </div>
        )}

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

        {/* Badges conquistados */}
        {badges.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '16px 20px', marginBottom: '20px'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Conquistas
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {BADGES.map(b => {
                const conquistado = badges.find(bg => bg.tipo === b.tipo)
                return (
                  <div key={b.tipo} style={{
                    padding: '6px 12px', borderRadius: '99px', fontSize: '13px',
                    background: conquistado ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                    color: conquistado ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                    border: conquistado ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    fontWeight: conquistado ? '600' : '400'
                  }}>
                    {b.emoji} {b.nome}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Botão notificações */}
        {!notificacaoAtiva && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '16px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: '0 0 2px' }}>
                🔔 Lembretes diários
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                Receba um aviso todo dia para não quebrar o streak
              </p>
            </div>
            <button onClick={ativarNotificacoes} style={{
              background: 'rgba(16,185,129,0.2)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: '99px',
              padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
            }}>
              Ativar
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
              const habitoBadges = badges.filter(b => b.habit_id === habito.id)
              return (
                <div key={habito.id} style={{ ...card(feito), justifyContent: 'space-between' }}>
                  <button onClick={() => toggleCheckin(habito.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '32px' }}>{habito.icon}</span>
                    <div>
                      <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: '0 0 2px' }}>{habito.name}</p>
                      {streak > 0 && (
                        <p style={{ color: feito ? 'rgba(255,255,255,0.7)' : '#f97316', fontSize: '12px', margin: '0 0 2px' }}>
                          🔥 {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
                        </p>
                      )}
                      {habitoBadges.length > 0 && (
                        <p style={{ fontSize: '12px', margin: 0, color: '#f59e0b' }}>
                          {habitoBadges.map(b => BADGES.find(bd => bd.tipo === b.tipo)?.emoji).join(' ')}
                        </p>
                      )}
                    </div>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '24px', transition: 'transform 0.3s',
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

            {podeCriarHabito() && (
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
            )}
          </div>
        )}

      </div>
    </main>
  )
}