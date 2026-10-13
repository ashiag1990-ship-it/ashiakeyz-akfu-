'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { SunoGenerator } from '@/components/SunoGenerator'
import { ElevenLabsRecorder } from '@/components/ElevenLabsRecorder'
import { AudioMixer } from '@/components/AudioMixer'
import { getStation, createAudioAsset, getAudioAssets } from '@/lib/api'
import { Station, AudioAsset, SunoClip } from '@/types'
import { useParams } from 'next/navigation'
import { useAudio } from '@/store/useAudio'
import { useProject } from '@/store/useProject'
import { useProgress } from '@/store/useProgress'

export default function StationPage() {
  const params = useParams()
  const stationId = params.stationId as string

  const [station, setStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'song' | 'voiceover' | 'mixer'>(
    'overview'
  )

  const { setAudioAssets, audioAssets } = useAudio()
  const { currentProject } = useProject()
  const { updateStationProgress } = useProgress()

  useEffect(() => {
    const loadStationData = async () => {
      try {
        const stationData = await getStation(stationId)
        setStation(stationData)
      } catch (error) {
        console.error('Failed to load station:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadAudioAssets = async () => {
      if (!currentProject?.id) return

      try {
        const assets = await getAudioAssets(currentProject.id)
        setAudioAssets(assets)
      } catch (error) {
        console.error('Failed to load audio assets:', error)
      }
    }

    loadStationData()
    loadAudioAssets()
  }, [stationId, currentProject?.id, setAudioAssets])

  const handleSongGenerated = async (clip: SunoClip) => {
    if (!station || !currentProject) return

    try {
      const asset: AudioAsset = {
        id: clip.id,
        project_id: currentProject.id,
        room_id: station.room_id,
        station_id: station.id,
        title: clip.title || 'Generated Song',
        description: 'Generated with Suno.ai',
        audio_url: clip.audio_url || '',
        audio_type: 'song',
        duration_seconds: clip.duration || 0,
        generator_type: 'suno',
        created_at: Date.now(),
      }

      await createAudioAsset(
        currentProject.id,
        station.room_id,
        station.id,
        {
          title: asset.title,
          description: asset.description,
          audio_url: asset.audio_url,
          audio_type: asset.audio_type,
          duration_seconds: asset.duration_seconds,
          generator_type: asset.generator_type,
        }
      )

      setAudioAssets([...audioAssets, asset])
    } catch (error) {
      console.error('Failed to save song:', error)
    }
  }

  const handleVoiceoverGenerated = async (blob: Blob, voiceId: string) => {
    if (!station || !currentProject) return

    try {
      const url = URL.createObjectURL(blob)

      const asset: AudioAsset = {
        id: `voiceover-${Date.now()}`,
        project_id: currentProject.id,
        room_id: station.room_id,
        station_id: station.id,
        title: 'Generated Voiceover',
        description: `Generated with ElevenLabs - Voice: ${voiceId}`,
        audio_url: url,
        audio_type: 'voiceover',
        duration_seconds: 0,
        generator_type: 'elevenlabs',
        created_at: Date.now(),
      }

      setAudioAssets([...audioAssets, asset])
    } catch (error) {
      console.error('Failed to save voiceover:', error)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen bg-akfu-dark flex items-center justify-center">
            <div className="text-gray-400">Loading station...</div>
          </main>
        </div>
      </>
    )
  }

  if (!station) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen bg-akfu-dark flex items-center justify-center">
            <div className="text-gray-400">Station not found</div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-akfu-dark">
          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-akfu-cyan to-akfu-gold bg-clip-text text-transparent">
                {station.title}
              </h1>
              <p className="text-gray-400 text-lg">{station.description}</p>
              <div className="mt-4 flex gap-4">
                <span className="px-3 py-1 bg-akfu-purple border border-akfu-cyan rounded text-sm">
                  {station.station_type}
                </span>
                <span className="px-3 py-1 bg-akfu-dark border border-akfu-gold rounded text-sm text-akfu-gold">
                  Station {station.station_order}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-akfu-purple">
              {(['overview', 'song', 'voiceover', 'mixer'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-bold transition border-b-2 ${
                    activeTab === tab
                      ? 'border-akfu-cyan text-akfu-cyan'
                      : 'border-transparent text-gray-400 hover:text-akfu-cyan'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div>
              {activeTab === 'overview' && (
                <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-8">
                  <h3 className="text-2xl font-bold text-akfu-cyan mb-4">Welcome to {station.title}</h3>
                  <p className="text-gray-400 mb-6">{station.success_message}</p>
                  <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="p-4 bg-akfu-dark rounded border border-akfu-purple">
                      <p className="text-akfu-gold font-bold text-lg">{audioAssets.length}</p>
                      <p className="text-gray-400 text-sm">Audio Assets</p>
                    </div>
                    <div className="p-4 bg-akfu-dark rounded border border-akfu-purple">
                      <p className="text-akfu-cyan font-bold text-lg">3</p>
                      <p className="text-gray-400 text-sm">Tools Available</p>
                    </div>
                    <div className="p-4 bg-akfu-dark rounded border border-akfu-purple">
                      <p className="text-akfu-cyan font-bold text-lg">100%</p>
                      <p className="text-gray-400 text-sm">Completion</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'song' && (
                <div>
                  <SunoGenerator onSongGenerated={handleSongGenerated} />
                </div>
              )}

              {activeTab === 'voiceover' && (
                <div>
                  <ElevenLabsRecorder onVoiceoverGenerated={handleVoiceoverGenerated} />
                </div>
              )}

              {activeTab === 'mixer' && (
                <div>
                  <AudioMixer />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
