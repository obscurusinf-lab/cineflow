'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Image as ImageIcon, Search, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Scene, Tag } from '@/lib/types'

type ViewMode = 'timeline' | 'grid' | 'storyboard'

const STATUS_COLORS: Record<string, string> = {
  not_shot: 'text-zinc-500 bg-zinc-500/10',
  shot: 'text-green-400 bg-green-400/10',
}
const STATUS_LABELS: Record<string, string> = {
  not_shot: 'Не снята',
  shot: 'Снята',
}

export default function SceneTimeline({
  scenes,
  tags,
  projectId,
  canManage,
}: {
  scenes: Scene[]
  tags: Tag[]
  projectId: string
  canManage: boolean
}) {
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return scenes.filter(scene => {
      if (filterStatus && scene.status !== filterStatus) return false
      if (filterTag) {
        const sceneTags = (scene as any).scene_tags?.map((st: any) => st.tag_id) ?? []
        if (!sceneTags.includes(filterTag)) return false
      }
      if (search) {
        const q = search.toLowerCase()
        return (
          scene.scene_number.toLowerCase().includes(q) ||
          scene.title?.toLowerCase().includes(q) ||
          scene.location?.toLowerCase().includes(q) ||
          scene.description?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [scenes, search, filterTag, filterStatus])

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру, локации, названию..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterStatus ?? ''}
          onChange={e => setFilterStatus(e.target.value || null)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Все статусы</option>
          <option value="not_shot">Не снята</option>
          <option value="shot">Снята</option>
        </select>

        <select
          value={filterTag ?? ''}
          onChange={e => setFilterTag(e.target.value || null)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Все теги</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {([['grid', LayoutGrid], ['timeline', List], ['storyboard', ImageIcon]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={cn('p-1.5 rounded-md transition', view === mode ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-100')}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Сцены не найдены</p>
        </div>
      ) : view === 'grid' ? (
        <GridView scenes={filtered} projectId={projectId} />
      ) : view === 'timeline' ? (
        <TimelineView scenes={filtered} projectId={projectId} />
      ) : (
        <StoryboardView scenes={filtered} projectId={projectId} />
      )}
    </div>
  )
}

function SceneKeyStill({ scene }: { scene: Scene }) {
  const keyStill = scene.stills?.find(s => s.is_key) ?? scene.stills?.[0]
  if (!keyStill) return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
      <Film className="w-8 h-8" />
    </div>
  )
  return <img src={keyStill.url} alt="" className="w-full h-full object-cover" />
}

function SceneTags({ scene }: { scene: Scene }) {
  const tags = (scene as any).scene_tags?.map((st: any) => st.tags).filter(Boolean) ?? []
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.slice(0, 3).map((tag: Tag) => (
        <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">{tag.name}</span>
      ))}
      {tags.length > 3 && <span className="text-xs text-zinc-500">+{tags.length - 3}</span>}
    </div>
  )
}

function GridView({ scenes, projectId }: { scenes: Scene[]; projectId: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {scenes.map(scene => (
        <Link key={scene.id} href={`/projects/${projectId}/scenes/${scene.id}`}
          className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition group">
          <div className="aspect-video overflow-hidden">
            <SceneKeyStill scene={scene} />
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-amber-400">Сц. {scene.scene_number}</span>
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', STATUS_COLORS[scene.status])}>
                {STATUS_LABELS[scene.status]}
              </span>
            </div>
            {scene.title && <p className="text-sm font-medium truncate">{scene.title}</p>}
            {scene.location && <p className="text-xs text-zinc-500 mt-0.5 truncate">{scene.location}</p>}
            <SceneTags scene={scene} />
          </div>
        </Link>
      ))}
    </div>
  )
}

function TimelineView({ scenes, projectId }: { scenes: Scene[]; projectId: string }) {
  return (
    <div className="space-y-2">
      {scenes.map((scene, i) => (
        <div key={scene.id} className="flex items-stretch gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-amber-400">{i + 1}</span>
            </div>
            {i < scenes.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-1" />}
          </div>
          <Link href={`/projects/${projectId}/scenes/${scene.id}`}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-2 hover:border-zinc-600 transition flex gap-4">
            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <SceneKeyStill scene={scene} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-amber-400 font-semibold">Сцена {scene.scene_number}</span>
                {scene.subscene && <span className="text-xs text-zinc-500">{scene.subscene}</span>}
                <span className={cn('text-xs px-2 py-0.5 rounded-full ml-auto', STATUS_COLORS[scene.status])}>
                  {STATUS_LABELS[scene.status]}
                </span>
              </div>
              {scene.title && <p className="text-sm font-medium">{scene.title}</p>}
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                {scene.location && <span>{scene.location}</span>}
                {scene.game_day && <span>День {scene.game_day}</span>}
                {scene.day_night && <span>{scene.day_night === 'day' ? 'День' : 'Ночь'}</span>}
                {scene.interior_exterior && <span>{scene.interior_exterior === 'interior' ? 'Инт.' : 'Экст.'}</span>}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

function StoryboardView({ scenes, projectId }: { scenes: Scene[]; projectId: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {scenes.map(scene => (
        <Link key={scene.id} href={`/projects/${projectId}/scenes/${scene.id}`}
          className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition group">
          <div className="aspect-[16/9] overflow-hidden relative">
            <SceneKeyStill scene={scene} />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <span className="text-sm font-mono text-amber-400 font-bold">Сцена {scene.scene_number}</span>
              {scene.title && <p className="text-white font-medium">{scene.title}</p>}
            </div>
          </div>
          <div className="p-4">
            {scene.description && <p className="text-sm text-zinc-400 line-clamp-2">{scene.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
              {scene.location && <span>{scene.location}</span>}
              {scene.game_day && <span>День {scene.game_day}</span>}
            </div>
            <SceneTags scene={scene} />
          </div>
        </Link>
      ))}
    </div>
  )
}
