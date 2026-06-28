'use client'

import { Film, LogOut } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between">
      <Link href="/projects" className="flex items-center gap-2">
        <div className="bg-amber-500 p-1.5 rounded-md">
          <Film className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold text-lg tracking-tight">CineFlow</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400">{user.email}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </header>
  )
}
