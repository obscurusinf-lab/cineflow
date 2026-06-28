'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewScenePage() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    scene_number: '',
    subscene: '',
    title: '',
    description: '',
    game_day: '',
    game_date: '',
    shoot_day: '',
    location: '',
    interior_exterior: '',
    day_night: '',
    chronological_order: '',
    duration: '',
    comments: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: scene, error } = await supabase
      .from('scenes')
      .insert({
        project_id: projectId,
        scene_number: form.scene_number,
        subscene: form.subscene || null,
        title: form.title || null,
        description: form.description || null,
        game_day: form.game_day ? parseInt(form.game_day) : null,
        game_date: form.game_date || null,
        shoot_day: form.shoot_day ? parseInt(form.shoot_day) : null,
        location: form.location || null,
        interior_exterior: form.interior_exterior || null,
        day_night: form.day_night || null,
        chronological_order: form.chronological_order ? parseInt(form.chronological_order) : 0,
        duration: form.duration || null,
        comments: form.comments || null,
      })
      .select()
      .single()

    if (!error && scene) router.push(`/projects/${projectId}/scenes/${scene.id}`)
    else setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/projects/${projectId}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Назад к проекту
      </Link>

      <h1 className="text-2xl font-bold mb-8">Новая сцена</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Основное">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Номер сцены *">
              <input required value={form.scene_number} onChange={e => set('scene_number', e.target.value)}
                className={INPUT} placeholder="1A" />
            </Field>
            <Field label="Подсцена">
              <input value={form.subscene} onChange={e => set('subscene', e.target.value)}
                className={INPUT} placeholder="A1" />
            </Field>
          </div>
          <Field label="Название">
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className={INPUT} placeholder="Утро в квартире" />
          </Field>
          <Field label="Описание">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} className={INPUT + ' resize-none'} placeholder="Краткое описание..." />
          </Field>
          <Field label="Хронологический порядок *">
            <input type="number" required value={form.chronological_order} onChange={e => set('chronological_order', e.target.value)}
              className={INPUT} placeholder="1" />
          </Field>
        </Section>

        <Section title="Место и время">
          <Field label="Локация">
            <input value={form.location} onChange={e => set('location', e.target.value)}
              className={INPUT} placeholder="Квартира Анны" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Инт./Экст.">
              <select value={form.interior_exterior} onChange={e => set('interior_exterior', e.target.value)} className={INPUT}>
                <option value="">—</option>
                <option value="interior">Интерьер</option>
                <option value="exterior">Экстерьер</option>
              </select>
            </Field>
            <Field label="День/Ночь">
              <select value={form.day_night} onChange={e => set('day_night', e.target.value)} className={INPUT}>
                <option value="">—</option>
                <option value="day">День</option>
                <option value="night">Ночь</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Дни">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Игровой день">
              <input type="number" value={form.game_day} onChange={e => set('game_day', e.target.value)} className={INPUT} placeholder="1" />
            </Field>
            <Field label="Съёмочный день">
              <input type="number" value={form.shoot_day} onChange={e => set('shoot_day', e.target.value)} className={INPUT} placeholder="1" />
            </Field>
            <Field label="Длительность">
              <input value={form.duration} onChange={e => set('duration', e.target.value)} className={INPUT} placeholder="00:02:30" />
            </Field>
          </div>
          <Field label="Игровая дата">
            <input type="date" value={form.game_date} onChange={e => set('game_date', e.target.value)} className={INPUT} />
          </Field>
        </Section>

        <Section title="Примечания">
          <Field label="Комментарии">
            <textarea value={form.comments} onChange={e => set('comments', e.target.value)}
              rows={3} className={INPUT + ' resize-none'} />
          </Field>
        </Section>

        <button type="submit" disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Создание...' : 'Создать сцену'}
        </button>
      </form>
    </div>
  )
}

const INPUT = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      {children}
    </div>
  )
}
