'use client'

import { useEffect, useState, useRef } from 'react'
import { useAudio } from '@/store/useAudio'
import { AudioMixer } from '@/lib/audio'

export function AudioMixer() {
  const { audioAssets, setAudioAssets } = useAudio()
  const mixerRef = useRef<AudioMixer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [masterVolume, setMasterVolume] = useState(1)
  const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    mixerRef.current = new AudioMixer()

    return () => {
      if (mixerRef.current) {
        mixerRef.current.dispose()
      }
    }
  }, [])

  const updateAnalyser = () => {
    if (mixerRef.current && isPlaying) {
      const data = mixerRef.current.getMasterAnalyserData()
      setAnalyserData(data)
      rafRef.current = requestAnimationFrame(updateAnalyser)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      updateAnalyser()
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isPlaying])

  const handleAddTrack = async (assetId: string) => {
    const asset = audioAssets.find((a) => a.id === assetId)
    if (!asset || !mixerRef.current) return

    try {
      const response = await fetch(asset.audio_url)
      const blob = await response.blob()
      await mixerRef.current.addTrack(asset.id, asset.title, blob)
    } catch (error) {
      console.error('Failed to add track:', error)
    }
  }

  const handlePlayAll = () => {
    if (!mixerRef.current) return

    if (isPlaying) {
      for (const track of mixerRef.current.tracks.values()) {
        mixerRef.current.stopTrack(track.id)
      }
      setIsPlaying(false)
    } else {
      for (const track of mixerRef.current.tracks.values()) {
        mixerRef.current.playTrack(track.id)
      }
      setIsPlaying(true)
    }
  }

  const handleExport = async () => {
    if (!mixerRef.current || mixerRef.current.tracks.size === 0) return

    try {
      const wavBlob = await mixerRef.current.exportWAV()
      const url = URL.createObjectURL(wavBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `akfu-mix-${Date.now()}.wav`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Master Controls */}
      <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6">
        <h3 className="text-xl font-bold text-akfu-cyan mb-6">Mix Master</h3>

        {/* Visualizer */}
        {analyserData && (
          <div className="mb-6 p-4 bg-akfu-dark rounded border border-akfu-purple">
            <div className="flex items-end justify-center gap-1 h-24">
              {Array.from(analyserData.slice(0, 32)).map((value, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-akfu-cyan to-akfu-gold rounded-t"
                  style={{ height: `${(value / 255) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Master Volume */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-300 mb-2">Master Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => {
              const vol = parseFloat(e.target.value)
              setMasterVolume(vol)
              if (mixerRef.current) {
                mixerRef.current.setMasterVolume(vol)
              }
            }}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{Math.round(masterVolume * 100)}%</span>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handlePlayAll}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded hover:shadow-lg hover:shadow-akfu-cyan/50 transition"
          >
            {isPlaying ? 'Stop' : 'Play All'}
          </button>
          <button
            onClick={handleExport}
            disabled={mixerRef.current?.tracks.size === 0}
            className="flex-1 px-4 py-2 bg-akfu-purple border border-akfu-cyan text-akfu-cyan font-bold rounded hover:bg-akfu-cyan hover:text-akfu-dark transition disabled:opacity-50"
          >
            Export WAV
          </button>
        </div>
      </div>

      {/* Tracks */}
      <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6">
        <h4 className="text-akfu-gold font-bold mb-4">Tracks</h4>
        {audioAssets.length === 0 ? (
          <p className="text-gray-400 text-sm">No audio tracks available. Generate some in the Sound Lab!</p>
        ) : (
          <div className="space-y-3">
            {audioAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-akfu-dark border border-akfu-purple rounded p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-bold text-white">{asset.title}</p>
                  <p className="text-xs text-gray-400">{asset.generator_type}</p>
                </div>
                <button
                  onClick={() => handleAddTrack(asset.id)}
                  className="px-4 py-1 bg-akfu-cyan text-akfu-dark font-bold rounded text-sm hover:bg-akfu-gold transition"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
