'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Film } from 'lucide-react'
import type { Scene, Still } from '@/lib/types'

function SceneThumb({ scene, label }: { scene: Scene; label: string }) {
  const keyStill = scene.stills?.find(s => s.is_key) ?? scene.stills?.[0]
  return (
    <div className="flex-1">
      <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">{label}</p>
      <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
        {keyStill ? (
          <img src={keyStill.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <Film className="w-6 h-6" />
          </div>
        )}
      </div>
      <p className="text-xs text-amber-400 font-mono mt-2">Сцена {scene.scene_number}</p>
      {scene.title && <p className="text-xs text-zinc-400">{scene.title}</p>}
    </div>
  )
}

export default function SceneComparison({
  currentScene,
  prevScene,
  nextScene,
}: {
  currentScene: Scene
  prevScene: Scene | null
  nextScene: Scene | null
}) {
  const [mode, setMode] = useState<'strip' | 'split'>('strip')

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Стыки сцен</h3>
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
          {(['strip', 'split'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`text-xs px-2 py-1 rounded-md transition ${mode === m ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {m === 'strip' ? 'Лента' : 'Split'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'strip' ? (
        <div className="flex gap-3">
          {prevScene && <SceneThumb scene={prevScene} label="Предыдущая" />}
          <SceneThumb scene={currentScene} label="Текущая" />
          {nextScene && <SceneThumb scene={nextScene} label="Следующая" />}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {prevScene && (
            <div>
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Предыдущая · Сц. {prevScene.scene_number}</p>
              <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                {(prevScene.stills?.[0] || prevScene.stills?.find(s => s.is_key)) ? (
                  <img
                    src={(prevScene.stills?.find(s => s.is_key) ?? prevScene.stills?.[0])?.url}
                    alt="" className="w-full h-full object-cover"
                  />
                ) : <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film className="w-6 h-6" /></div>}
              </div>
            </div>
          )}
          {nextScene && (
            <div>
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Следующая · Сц. {nextScene.scene_number}</p>
              <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                {(nextScene.stills?.[0] || nextScene.stills?.find(s => s.is_key)) ? (
                  <img
                    src={(nextScene.stills?.find(s => s.is_key) ?? nextScene.stills?.[0])?.url}
                    alt="" className="w-full h-full object-cover"
                  />
                ) : <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film className="w-6 h-6" /></div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
