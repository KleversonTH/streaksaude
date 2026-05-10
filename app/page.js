import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-green-600 mb-2">StreakSaúde</h1>
        <p className="text-gray-500 mb-8">Crie hábitos saudáveis e mantenha sua sequência todos os dias.</p>
        <Link
          href="/login"
          className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition"
        >
          Começar agora
        </Link>
      </div>
    </main>
  )
}