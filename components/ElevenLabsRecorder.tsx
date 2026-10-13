'use client'

import { useEffect, useState } from 'react'
import { getVoices, generateVoiceover, Voice } from '@/lib/elevenlabs'

interface ElevenLabsRecorderProps {
  onVoiceoverGenerated?: (blob: Blob, voiceId: string) => void
}

export function ElevenLabsRecorder({ onVoiceoverGenerated }: ElevenLabsRecorderProps) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    setLoading(true)
    try {
      const voiceList = await getVoices()
      setVoices(voiceList)
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0].voice_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voices')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError('Please enter a script')
      return
    }

    if (!selectedVoice) {
      setError('Please select a voice')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const audioBlob = await generateVoiceover({
        text: script,
        voice_id: selectedVoice,
      })

      const url = URL.createObjectURL(audioBlob)
      setPreview(url)

      onVoiceoverGenerated?.(audioBlob, selectedVoice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate voiceover')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6">
        <h3 className="text-xl font-bold text-akfu-cyan mb-4">Record Voiceover</h3>

        {/* Voice Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-300 mb-2">Select Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={loading}
            className="w-full bg-akfu-dark border border-akfu-purple rounded px-4 py-2 text-white focus:outline-none focus:border-akfu-cyan"
          >
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        {/* Script Input */}
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter the script or text you want to convert to speech..."
          className="w-full bg-akfu-dark border border-akfu-purple rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-akfu-cyan mb-4"
          rows={5}
        />

        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={generating || loading}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded hover:shadow-lg hover:shadow-akfu-cyan/50 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Voiceover'}
          </button>

          <button
            onClick={loadVoices}
            disabled={loading}
            className="px-6 py-2 bg-akfu-purple border border-akfu-cyan text-akfu-cyan font-bold rounded hover:bg-akfu-cyan hover:text-akfu-dark transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Voices'}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6">
          <h4 className="text-akfu-gold font-bold mb-4">Preview</h4>
          <audio src={preview} controls className="w-full" />
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.href = preview
              link.download = `voiceover-${Date.now()}.mp3`
              link.click()
            }}
            className="w-full mt-4 px-4 py-2 bg-akfu-cyan text-akfu-dark font-bold rounded hover:bg-akfu-gold transition"
          >
            Download Audio
          </button>
        </div>
      )}
    </div>
  )
}
