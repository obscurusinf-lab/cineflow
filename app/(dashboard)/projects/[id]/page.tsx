import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, Search } from 'lucide-react'
import SceneTimeline from '@/components/scenes/SceneTimeline'
import type { Scene, Tag } from '@/lib/types'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: scenes } = await supabase
    .from('scenes')
    .select('*, stills(*), scene_tags(tag_id, tags(*))')
    .eq('project_id', id)
    .order('chronological_order', { ascending: true })

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .eq('project_id', id)

  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', id)
    .single()

  const canManage = ['admin', 'director', 'script_supervisor'].includes(member?.role ?? '')

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {project.production_company && `${project.production_company} · `}
            {scenes?.length ?? 0} сцен
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <Link
              href={`/projects/${id}/scenes/new`}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Добавить сцену
            </Link>
          )}
          <Link
            href={`/projects/${id}/settings`}
            className="p-2 text-zinc-400 hover:text-zinc-100 border border-zinc-800 rounded-lg transition"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <SceneTimeline
        scenes={(scenes ?? []) as unknown as Scene[]}
        tags={(tags ?? []) as Tag[]}
        projectId={id}
        canManage={canManage}
      />
    </div>
  )
}
