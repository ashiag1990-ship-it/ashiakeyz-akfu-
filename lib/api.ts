const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token') || process.env.NEXT_PUBLIC_AUTH_TOKEN

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API error')
  }

  return response.json()
}

export async function getRooms() {
  return apiCall('/api/rooms')
}

export async function getRoom(roomId: string) {
  return apiCall(`/api/rooms/${roomId}`)
}

export async function getRoomBySlug(slug: string) {
  return apiCall(`/api/rooms/${slug}/by-slug`)
}

export async function getStation(stationId: string) {
  return apiCall(`/api/stations/${stationId}`)
}

export async function trackRoomProgress(projectId: string, roomId: string) {
  return apiCall('/api/room-progress', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, room_id: roomId }),
  })
}

export async function getRoomProgress(projectId: string) {
  return apiCall(`/api/room-progress/${projectId}`)
}

export async function trackStationProgress(
  projectId: string,
  roomId: string,
  stationId: string,
  data?: Record<string, any>
) {
  return apiCall('/api/station-progress', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      room_id: roomId,
      station_id: stationId,
      station_data: data,
      completion_status: 'completed',
    }),
  })
}

export async function getStationProgress(projectId: string) {
  return apiCall(`/api/station-progress/${projectId}`)
}

export async function createAudioAsset(
  projectId: string,
  roomId: string,
  stationId: string,
  data: {
    title: string
    description: string
    audio_url: string
    audio_type: string
    duration_seconds: number
    generator_type: string
    generation_prompt?: string
  }
) {
  return apiCall('/api/audio-assets', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      room_id: roomId,
      station_id: stationId,
      ...data,
    }),
  })
}

export async function getAudioAssets(projectId: string) {
  return apiCall(`/api/audio-assets/${projectId}`)
}

export async function updateAudioAsset(assetId: string, data: Partial<any>) {
  return apiCall(`/api/audio-assets/${assetId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
