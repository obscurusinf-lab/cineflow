export type ProjectType = 'film' | 'series' | 'commercial' | 'clip'
export type ProjectStatus = 'pre_production' | 'production' | 'post_production' | 'completed'
export type SceneStatus = 'not_shot' | 'shot'
export type InteriorExterior = 'interior' | 'exterior'
export type DayNight = 'day' | 'night'
export type UserRole = 'admin' | 'director' | 'cinematographer' | 'script_supervisor' | 'costume' | 'makeup' | 'props' | 'lighting'

export interface Project {
  id: string
  name: string
  type: ProjectType
  status: ProjectStatus
  start_date: string | null
  production_company: string | null
  created_by: string
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: UserRole
  created_at: string
  user?: { email: string; full_name: string | null }
}

export interface Scene {
  id: string
  project_id: string
  scene_number: string
  subscene: string | null
  title: string | null
  description: string | null
  game_day: number | null
  game_date: string | null
  shoot_day: number | null
  location: string | null
  interior_exterior: InteriorExterior | null
  day_night: DayNight | null
  status: SceneStatus
  chronological_order: number
  duration: string | null
  comments: string | null
  created_at: string
  stills?: Still[]
  tags?: Tag[]
  camera_data?: CameraData | null
}

export interface Still {
  id: string
  scene_id: string
  url: string
  description: string | null
  angle: string | null
  timecode: string | null
  comment: string | null
  is_key: boolean
  uploaded_by: string
  created_at: string
  uploader?: { full_name: string | null; email: string }
}

export interface Tag {
  id: string
  project_id: string
  type: 'character' | 'costume' | 'makeup' | 'props' | 'location'
  name: string
  created_at: string
}

export interface SceneTag {
  scene_id: string
  tag_id: string
  tag?: Tag
}

export interface CameraData {
  id: string
  scene_id: string
  camera: string | null
  lens: string | null
  focal_length: string | null
  aperture: string | null
  iso: string | null
  fps: string | null
  white_balance: string | null
  lut: string | null
  filters: string | null
  camera_height: string | null
  camera_movement: string | null
}

export interface Comment {
  id: string
  scene_id: string
  user_id: string
  text: string
  created_at: string
  user?: { full_name: string | null; email: string }
}
