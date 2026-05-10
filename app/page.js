import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-8">

      <header className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold text-primary">StreakSaúde</span>
        </div>
        <Link
          href="/login"
          className="glass px-5 py-2 text-sm font-medium text-primary hover:bg-white/10 transition"
          style={{borderRadius: '99px'}}
        >
          Entrar
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
        <div className="glass px-4 py-2 text-sm font-medium text-accent mb-8 inline-flex items-center gap-2" style={{borderRadius:'99px'}}>
          🌱 Construa hábitos que duram
        </div>

        <h1 className="text-5xl font-bold text-primary mb-4 leading-tight">
          Seus hábitos.<br />
          <span className="text-accent">Seu progresso.</span>
        </h1>

        <p className="text-secondary text-lg mb-10 leading-relaxed">
          Registre seus hábitos diários, mantenha sua sequência e veja sua evolução ao longo do tempo.
        </p>

        <Link href="/login" className="btn-primary mb-4">
          Começar gratuitamente
        </Link>

        <p className="text-secondary text-sm">Grátis para sempre. Sem cartão de crédito.</p>
      </section>

      <section className="grid grid-cols-3 gap-3 max-w-md mx-auto w-full mt-16 pb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl mb-2">🔥</p>
          <p className="text-xs font-medium text-primary">Streaks diários</p>
          <p className="text-xs text-secondary mt-1">Nunca perca sua sequência</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-xs font-medium text-primary">Histórico visual</p>
          <p className="text-xs text-secondary mt-1">Veja sua evolução</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl mb-2">🔔</p>
          <p className="text-xs font-medium text-primary">Lembretes</p>
          <p className="text-xs text-secondary mt-1">No horário certo</p>
        </div>
      </section>

    </main>
  )
}