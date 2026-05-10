'use client'

import { createClient } from '../../lib/supabase'

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">Entrar</h1>
        <p className="text-gray-500 mb-6">Acesse sua conta para ver seus hábitos</p>
        <button
          onClick={loginComGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 hover:bg-gray-50 transition font-medium"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          Continuar com Google
        </button>
      </div>
    </main>
  )
}