'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Star, ZoomIn } from 'lucide-react'
import type { Still } from '@/lib/types'

export default function StillsGallery({
  stills,
  sceneId,
  canUpload,
  userId,
}: {
  stills: Still[]
  sceneId: string
  canUpload: boolean
  userId: string
}) {
  const [items, setItems] = useState<Still[]>(stills)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Still | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${sceneId}/${Date.now()}.${ext}`
      const { data: upload } = await supabase.storage.from('stills').upload(path, file)
      if (!upload) continue

      const { data: { publicUrl } } = supabase.storage.from('stills').getPublicUrl(path)

      const { data: still } = await supabase
        .from('stills')
        .insert({ scene_id: sceneId, url: publicUrl, uploaded_by: userId, is_key: items.length === 0 })
        .select()
        .single()

      if (still) setItems(prev => [...prev, still as Still])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function setKeyStill(id: string) {
    await supabase.from('stills').update({ is_key: false }).eq('scene_id', sceneId)
    await supabase.from('stills').update({ is_key: true }).eq('id', id)
    setItems(prev => prev.map(s => ({ ...s, is_key: s.id === id })))
  }

  async function deleteStill(id: string) {
    await supabase.from('stills').delete().eq('id', id)
    setItems(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Стиллы <span className="text-zinc-500 font-normal text-sm">({items.length})</span></h3>
        {canUpload && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Загрузка...' : 'Загрузить'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </>
        )}
      </div>

      {items.length === 0 ? (
        <div
          onClick={() => canUpload && fileRef.current?.click()}
          className={`border-2 border-dashed border-zinc-800 rounded-xl aspect-video flex flex-col items-center justify-center text-zinc-600 ${canUpload ? 'cursor-pointer hover:border-zinc-600 transition' : ''}`}
        >
          <Upload className="w-8 h-8 mb-2" />
          <p className="text-sm">{canUpload ? 'Нажмите, чтобы загрузить стиллы' : 'Стиллы не загружены'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map(still => (
            <div
              key={still.id}
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group border border-zinc-800 hover:border-zinc-600 transition"
              onClick={() => setSelected(still)}
            >
              <img src={still.url} alt={still.description ?? ''} className="w-full h-full object-cover" />
              {still.is_key && (
                <div className="absolute top-1 left-1 bg-amber-500 rounded-full p-0.5">
                  <Star className="w-3 h-3 text-black fill-black" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {canUpload && (
                  <button
                    onClick={() => setKeyStill(selected.id)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition ${selected.is_key ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                  >
                    <Star className="w-3 h-3" />
                    {selected.is_key ? 'Ключевой' : 'Сделать ключевым'}
                  </button>
                )}
                {selected.angle && <span className="text-xs text-zinc-400">{selected.angle}</span>}
                {selected.timecode && <span className="text-xs text-zinc-500 font-mono">{selected.timecode}</span>}
              </div>
              <div className="flex items-center gap-2">
                {canUpload && (
                  <button
                    onClick={() => deleteStill(selected.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Удалить
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <img src={selected.url} alt="" className="w-full rounded-xl max-h-[70vh] object-contain" />
            {selected.comment && <p className="text-sm text-zinc-400 mt-3">{selected.comment}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
