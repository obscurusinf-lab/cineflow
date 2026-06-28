'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import type { Comment } from '@/lib/types'

function formatTime(dt: string) {
  return new Date(dt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function SceneComments({
  comments,
  sceneId,
  userId,
}: {
  comments: Comment[]
  sceneId: string
  userId: string
}) {
  const [items, setItems] = useState<Comment[]>(comments)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)

    const { data } = await supabase
      .from('comments')
      .insert({ scene_id: sceneId, user_id: userId, text: text.trim() })
      .select('*, profiles(full_name, email)')
      .single()

    if (data) setItems(prev => [...prev, data as unknown as Comment])
    setText('')
    setSending(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="font-semibold mb-4">Комментарии <span className="text-zinc-500 font-normal text-sm">({items.length})</span></h3>

      <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Нет комментариев</p>
        ) : (
          items.map(c => (
            <div key={c.id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-zinc-300">
                  {(c as any).profiles?.full_name ?? (c as any).profiles?.email ?? 'Пользователь'}
                </span>
                <span className="text-xs text-zinc-600">{formatTime(c.created_at)}</span>
              </div>
              <p className="text-zinc-400">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Написать комментарий..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
