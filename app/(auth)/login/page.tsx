'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Film } from 'lucide-react'

function toEmail(username: string) {
  return `${username.toLowerCase().replace(/\s+/g, '_')}@cineflow.app`
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const email = toEmail(username)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || username } },
      })
      if (error) setError(error.message)
      else router.push('/projects')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Неверный логин или пароль')
      else router.push('/projects')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="bg-amber-500 p-2 rounded-lg">
            <Film className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tight">CineFlow</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h1 className="text-xl font-semibold mb-6">
            {isRegister ? 'Создать аккаунт' : 'Войти'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Имя</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Иван Иванов"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Логин</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                placeholder="ivan_petrov"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-4">
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null) }}
              className="text-amber-500 hover:underline"
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
