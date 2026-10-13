'use client'

import { useState } from 'react'
import { generateSong } from '@/lib/suno'
import { SunoClip } from '@/lib/suno'

interface SunoGeneratorProps {
  onSongGenerated?: (clip: SunoClip) => void
}

export function SunoGenerator({ onSongGenerated }: SunoGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clips, setClips] = useState<SunoClip[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a song description')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const generatedClips = await generateSong({
        prompt: prompt,
        make_instrumental: isInstrumental,
      })
      setClips(generatedClips)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate song')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6">
        <h3 className="text-xl font-bold text-akfu-cyan mb-4">Write a Song</h3>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the song you want to create (genre, mood, style, lyrics ideas...)"
          className="w-full bg-akfu-dark border border-akfu-purple rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-akfu-cyan mb-4"
          rows={4}
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isInstrumental}
              onChange={(e) => setIsInstrumental(e.target.checked)}
              className="w-4 h-4 bg-akfu-dark border border-akfu-purple rounded"
            />
            <span>Instrumental</span>
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded hover:shadow-lg hover:shadow-akfu-cyan/50 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Song'}
          </button>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</div>}
      </div>

      {/* Generated Clips */}
      {clips.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-akfu-gold font-bold">Generated Songs</h4>
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{clip.title || 'Untitled Song'}</p>
                  <p className="text-sm text-gray-400">ID: {clip.id.slice(0, 8)}...</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  clip.status === 'complete'
                    ? 'bg-green-900/30 text-green-400'
                    : clip.status === 'error'
                    ? 'bg-red-900/30 text-red-400'
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {clip.status}
                </span>
              </div>

              {clip.audio_url && (
                <audio
                  src={clip.audio_url}
                  controls
                  className="w-full mb-3"
                />
              )}

              {clip.status === 'complete' && clip.audio_url && (
                <button
                  onClick={() => onSongGenerated?.(clip)}
                  className="w-full px-4 py-2 bg-akfu-cyan text-akfu-dark font-bold rounded hover:bg-akfu-gold transition"
                >
                  Save to Library
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
