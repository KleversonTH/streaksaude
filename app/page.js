import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🔥</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>StreakSaúde</span>
        </div>
        <Link href="/login" style={{
          fontSize: '14px', fontWeight: '500', color: 'white', textDecoration: 'none',
          padding: '8px 20px', borderRadius: '99px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)'
        }}>
          Entrar
        </Link>
      </header>

      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '99px', padding: '6px 16px', marginBottom: '32px',
          color: '#10b981', fontSize: '14px', fontWeight: '500'
        }}>
          🌱 Construa hábitos que duram
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', lineHeight: '1.1', marginBottom: '16px' }}>
          Seus hábitos.<br />
          <span style={{ color: '#10b981' }}>Seu progresso.</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '360px' }}>
          Registre seus hábitos diários, mantenha sua sequência e veja sua evolução ao longo do tempo.
        </p>

        <Link href="/login" style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white', textDecoration: 'none', padding: '16px 36px',
          borderRadius: '99px', fontWeight: '600', fontSize: '16px',
          boxShadow: '0 4px 20px rgba(16,185,129,0.4)', marginBottom: '16px',
          display: 'inline-block'
        }}>
          Começar gratuitamente
        </Link>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
          Grátis para sempre. Sem cartão de crédito.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '480px', margin: '64px auto 32px', width: '100%' }}>
        {[
          { icon: '🔥', title: 'Streaks diários', desc: 'Nunca perca sua sequência' },
          { icon: '📊', title: 'Histórico visual', desc: 'Veja sua evolução' },
          { icon: '🔔', title: 'Lembretes', desc: 'No horário certo' },
        ].map(item => (
          <div key={item.title} style={{
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '20px', textAlign: 'center'
          }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</p>
            <p style={{ color: 'white', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{item.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{item.desc}</p>
          </div>
        ))}
      </section>

    </main>
  )
}