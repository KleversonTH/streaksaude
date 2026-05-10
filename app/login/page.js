'use client'

import { createClient } from '../../lib/supabase'
import Link from 'next/link'

export default function Login() {
  const supabase = createClient()

  async function loginComGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>

      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
            marginBottom: '16px',
            fontSize: '40px'
          }}>
            🔥
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>
            StreakSaúde
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Entre para continuar sua sequência
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px',
          padding: '32px'
        }}>
          <button
            onClick={loginComGoogle}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <img src="https://www.google.com/favicon.ico" style={{ width: '20px', height: '20px' }} />
            Continuar com Google
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '24px', marginBottom: 0 }}>
            Ao entrar você concorda com nossos termos de uso.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            ← Voltar ao início
          </Link>
        </div>

      </div>

    </main>
  )
}