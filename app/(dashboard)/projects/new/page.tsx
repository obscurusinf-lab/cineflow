'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'film',
    status: 'pre_production',
    start_date: '',
    production_company: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: form.name,
        type: form.type,
        status: form.status,
        start_date: form.start_date || null,
        production_company: form.production_company || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !project) { setLoading(false); return }

    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: user.id,
      role: 'admin',
    })

    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <Link href="/projects" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Назад к проектам
      </Link>

      <h1 className="text-2xl font-bold mb-8">Новый проект</h1>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Название проекта *</label>
          <input
            type="text" required value={form.name}
            onChange={e => set('name', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            placeholder="Мой фильм"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Тип</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
              <option value="film">Фильм</option>
              <option value="series">Сериал</option>
              <option value="commercial">Реклама</option>
              <option value="clip">Клип</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Статус</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
              <option value="pre_production">Подготовка</option>
              <option value="production">Съёмки</option>
              <option value="post_production">Постпродакшн</option>
              <option value="completed">Завершён</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Дата начала</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Производственная компания</label>
          <input type="text" value={form.production_company} onChange={e => set('production_company', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            placeholder="Название компании" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-lg transition disabled:opacity-50">
          {loading ? 'Создание...' : 'Создать проект'}
        </button>
      </form>
    </div>
  )
}
