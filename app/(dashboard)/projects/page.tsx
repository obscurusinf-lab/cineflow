import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Film } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/lib/types'

const PROJECT_TYPE_LABELS: Record<string, string> = {
  film: 'Фильм', series: 'Сериал', commercial: 'Реклама', clip: 'Клип',
}
const STATUS_LABELS: Record<string, string> = {
  pre_production: 'Подготовка', production: 'Съёмки', post_production: 'Постпродакшн', completed: 'Завершён',
}
const STATUS_COLORS: Record<string, string> = {
  pre_production: 'text-blue-400 bg-blue-400/10',
  production: 'text-amber-400 bg-amber-400/10',
  post_production: 'text-purple-400 bg-purple-400/10',
  completed: 'text-green-400 bg-green-400/10',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('project_members')
    .select('project_id, role, projects(*)')
    .eq('user_id', user!.id)

  const projects = memberships?.map(m => ({
    ...(m.projects as unknown as Project),
    myRole: m.role,
  })) ?? []

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Мои проекты</h1>
          <p className="text-zinc-400 text-sm mt-1">Все проекты, к которым у вас есть доступ</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Новый проект
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Нет проектов</p>
          <p className="text-sm mt-1">Создайте первый проект или попросите коллегу пригласить вас</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  {PROJECT_TYPE_LABELS[project.type]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status]}`}>
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <h2 className="font-semibold text-lg group-hover:text-amber-400 transition">{project.name}</h2>
              {project.production_company && (
                <p className="text-sm text-zinc-400 mt-1">{project.production_company}</p>
              )}
              <p className="text-xs text-zinc-600 mt-3">
                {project.start_date ? `Начало: ${formatDate(project.start_date)}` : 'Дата не указана'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
