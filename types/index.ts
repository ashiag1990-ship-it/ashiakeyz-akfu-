export interface Room {
  id: string
  slug: string
  title: string
  description: string
  department: string
  order_index: number
  status: string
}

export interface Station {
  id: string
  room_id: string
  slug: string
  title: string
  description: string
  station_order: number
  station_type: string
  loading_message: string
  success_message: string
  failure_message: string
  status: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  created_at: number
}

export interface AudioAsset {
  id: string
  project_id: string
  room_id: string
  station_id: string
  title: string
  description: string
  audio_url: string
  audio_type: string
  duration_seconds: number
  generator_type: string
  created_at: number
}

export interface RoomProgress {
  id: string
  room_id: string
  visit_count: number
  first_visited_at: number
  last_visited_at: number
  completion_status: string
}

export interface StationProgress {
  id: string
  station_id: string
  room_id: string
  visit_count: number
  completion_status: string
  station_data?: Record<string, any>
}
