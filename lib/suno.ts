export interface SunoGenerateRequest {
  prompt?: string
  gpt_description_prompt?: string
  make_instrumental?: boolean
  duration_seconds?: number
  temperature?: number
  top_k?: number
  top_p?: number
  negative_prompt?: string
}

export interface SunoClip {
  id: string
  title: string
  image_url?: string
  lyric?: string
  gpt_description_prompt?: string
  audio_url?: string
  video_url?: string
  duration?: number
  status: 'submitted' | 'processing' | 'complete' | 'error'
  error_message?: string
}

const SUNO_API_BASE = 'https://api.suno.ai'

export async function generateSong(request: SunoGenerateRequest): Promise<SunoClip[]> {
  const apiKey = process.env.NEXT_PUBLIC_SUNO_API_KEY
  if (!apiKey) {
    throw new Error('Suno API key not configured')
  }

  const response = await fetch(`${SUNO_API_BASE}/generate/music`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      make_instrumental: request.make_instrumental || false,
      ...request,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to generate song')
  }

  const data = await response.json()
  return data.clips || [data]
}

export async function getSongStatus(clipIds: string[]): Promise<SunoClip[]> {
  const apiKey = process.env.NEXT_PUBLIC_SUNO_API_KEY
  if (!apiKey) {
    throw new Error('Suno API key not configured')
  }

  const response = await fetch(`${SUNO_API_BASE}/clips/${clipIds.join(',')}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get song status')
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [data]
}

export async function downloadSong(audioUrl: string): Promise<Blob> {
  const response = await fetch(audioUrl)
  if (!response.ok) {
    throw new Error('Failed to download song')
  }
  return response.blob()
}
