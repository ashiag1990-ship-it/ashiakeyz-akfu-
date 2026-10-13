import { create } from 'zustand'
import { AudioAsset } from '@/types'

interface AudioState {
  audioAssets: AudioAsset[]
  currentlyPlaying: AudioAsset | null
  isPlaying: boolean
  volume: number
  loading: boolean
  error: string | null

  setAudioAssets: (assets: AudioAsset[]) => void
  setCurrentlyPlaying: (asset: AudioAsset | null) => void
  setIsPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addAudioAsset: (asset: AudioAsset) => void
  removeAudioAsset: (assetId: string) => void
}

export const useAudio = create<AudioState>((set, get) => ({
  audioAssets: [],
  currentlyPlaying: null,
  isPlaying: false,
  volume: 1,
  loading: false,
  error: null,

  setAudioAssets: (audioAssets) => set({ audioAssets }),
  setCurrentlyPlaying: (currentlyPlaying) => set({ currentlyPlaying }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addAudioAsset: (asset) => {
    set({ audioAssets: [...get().audioAssets, asset] })
  },

  removeAudioAsset: (assetId) => {
    set({
      audioAssets: get().audioAssets.filter(a => a.id !== assetId),
      currentlyPlaying: get().currentlyPlaying?.id === assetId ? null : get().currentlyPlaying
    })
  },
}))
