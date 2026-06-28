import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Edit } from 'lucide-react'
import StillsGallery from '@/components/stills/StillsGallery'
import SceneComments from '@/components/scenes/SceneComments'
import SceneComparison from '@/components/scenes/SceneComparison'
import type { Scene, Still, Comment } from '@/lib/types'

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string; sceneId: string }>
}) {
  const { id: projectId, sceneId } = await params
  const supabase = await createClient()

  const { data: scene } = await supabase
    .from('scenes')
    .select('*, stills(*), scene_tags(tag_id, tags(*)), camera_data(*)')
    .eq('id', sceneId)
    .single()

  if (!scene) notFound()

  const { data: allScenes } = await supabase
    .from('scenes')
    .select('id, scene_number, title, chronological_order, stills(*)')
    .eq('project_id', projectId)
    .order('chronological_order', { ascending: true })

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(full_name, email)')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: true })

  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  const currentIndex = allScenes?.findIndex(s => s.id === sceneId) ?? -1
  const prevScene = currentIndex > 0 ? allScenes![currentIndex - 1] : null
  const nextScene = currentIndex < (allScenes?.length ?? 0) - 1 ? allScenes![currentIndex + 1] : null

  const tags = (scene as any).scene_tags?.map((st: any) => st.tags).filter(Boolean) ?? []
  const canManage = ['admin', 'director', 'script_supervisor'].includes(member?.role ?? '')

  const DAY_NIGHT: Record<string, string> = { day: 'День', night: 'Ночь' }
  const INT_EXT: Record<string, string> = { interior: 'Интерьер', exterior: 'Экстерьер' }
  const STATUS: Record<string, string> = { not_shot: 'Не снята', shot: 'Снята' }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/projects/${projectId}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition">
          <ArrowLeft className="w-4 h-4" />
          К ленте
        </Link>
        <div className="flex items-center gap-3">
          {prevScene && (
            <Link href={`/projects/${projectId}/scenes/${prevScene.id}`}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition">
              <ArrowLeft className="w-4 h-4" />
              Сц. {prevScene.scene_number}
            </Link>
          )}
          {nextScene && (
            <Link href={`/projects/${projectId}/scenes/${nextScene.id}`}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition">
              Сц. {nextScene.scene_number}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {canManage && (
            <Link href={`/projects/${projectId}/scenes/${sceneId}/edit`}
              className="flex items-center gap-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition">
              <Edit className="w-3.5 h-3.5" />
              Редактировать
            </Link>
          )}
        </div>
      </div>

      {/* Scene title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-mono font-bold text-amber-400">Сцена {scene.scene_number}</span>
          {scene.subscene && <span className="text-zinc-500">{scene.subscene}</span>}
          <span className={`text-sm px-2 py-0.5 rounded-full ${scene.status === 'shot' ? 'text-green-400 bg-green-400/10' : 'text-zinc-400 bg-zinc-400/10'}`}>
            {STATUS[scene.status]}
          </span>
        </div>
        {scene.title && <h1 className="text-xl font-semibold">{scene.title}</h1>}
        {scene.description && <p className="text-zinc-400 mt-2">{scene.description}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: stills + comparison */}
        <div className="lg:col-span-2 space-y-8">
          <StillsGallery
            stills={(scene.stills ?? []) as Still[]}
            sceneId={sceneId}
            canUpload={canManage || ['director'].includes(member?.role ?? '')}
            userId={user!.id}
          />

          {(prevScene || nextScene) && (
            <SceneComparison
              currentScene={scene as unknown as Scene}
              prevScene={prevScene as unknown as Scene | null}
              nextScene={nextScene as unknown as Scene | null}
            />
          )}
        </div>

        {/* Right: metadata + comments */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Данные сцены</h3>
            <dl className="space-y-3 text-sm">
              {scene.location && <MetaRow label="Локация" value={scene.location} />}
              {scene.interior_exterior && <MetaRow label="Место" value={INT_EXT[scene.interior_exterior]} />}
              {scene.day_night && <MetaRow label="Время" value={DAY_NIGHT[scene.day_night]} />}
              {scene.game_day && <MetaRow label="Игровой день" value={String(scene.game_day)} />}
              {scene.game_date && <MetaRow label="Игровая дата" value={scene.game_date} />}
              {scene.shoot_day && <MetaRow label="Съёмочный день" value={String(scene.shoot_day)} />}
              {scene.duration && <MetaRow label="Длительность" value={String(scene.duration)} />}
            </dl>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any) => (
                  <span key={tag.id} className={`text-xs px-2 py-1 rounded-full font-medium ${TAG_COLORS[tag.type]}`}>
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Camera */}
          {scene.camera_data && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Камера</h3>
              <dl className="space-y-3 text-sm">
                {scene.camera_data.camera && <MetaRow label="Камера" value={scene.camera_data.camera} />}
                {scene.camera_data.lens && <MetaRow label="Объектив" value={scene.camera_data.lens} />}
                {scene.camera_data.focal_length && <MetaRow label="Фокусное" value={scene.camera_data.focal_length} />}
                {scene.camera_data.aperture && <MetaRow label="Диафрагма" value={scene.camera_data.aperture} />}
                {scene.camera_data.iso && <MetaRow label="ISO" value={scene.camera_data.iso} />}
                {scene.camera_data.fps && <MetaRow label="FPS" value={scene.camera_data.fps} />}
                {scene.camera_data.camera_movement && <MetaRow label="Движение" value={scene.camera_data.camera_movement} />}
              </dl>
            </div>
          )}

          {/* Comments */}
          <SceneComments
            comments={(comments ?? []) as unknown as Comment[]}
            sceneId={sceneId}
            userId={user!.id}
          />
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-zinc-500 flex-shrink-0">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}

const TAG_COLORS: Record<string, string> = {
  character: 'bg-blue-500/15 text-blue-400',
  costume: 'bg-purple-500/15 text-purple-400',
  makeup: 'bg-pink-500/15 text-pink-400',
  props: 'bg-orange-500/15 text-orange-400',
  location: 'bg-green-500/15 text-green-400',
}
