export interface Voice {
  voice_id: string
  name: string
  category?: string
  description?: string
}

export interface VoiceSettings {
  stability?: number
  similarity_boost?: number
}

export interface TextToSpeechRequest {
  text: string
  voice_id: string
  model_id?: string
  voice_settings?: VoiceSettings
}

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1'

export async function getVoices(): Promise<Voice[]> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    headers: {
      'xi-api-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch voices')
  }

  const data = await response.json()
  return data.voices || []
}

export async function generateVoiceover(request: TextToSpeechRequest): Promise<Blob> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${request.voice_id}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        model_id: request.model_id || 'eleven_monolingual_v1',
        voice_settings: request.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to generate voiceover')
  }

  return response.blob()
}

export async function downloadAudio(blob: Blob, filename: string = 'voiceover.mp3') {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
