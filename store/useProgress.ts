import { create } from 'zustand'
import { RoomProgress, StationProgress } from '@/types'

interface ProgressState {
  roomProgress: RoomProgress[]
  stationProgress: StationProgress[]
  loading: boolean
  error: string | null

  setRoomProgress: (progress: RoomProgress[]) => void
  setStationProgress: (progress: StationProgress[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateRoomProgress: (progress: RoomProgress) => void
  updateStationProgress: (progress: StationProgress) => void
  getRoomCompletionPercentage: () => number
  getStationCompletionPercentage: () => number
}

export const useProgress = create<ProgressState>((set, get) => ({
  roomProgress: [],
  stationProgress: [],
  loading: false,
  error: null,

  setRoomProgress: (roomProgress) => set({ roomProgress }),
  setStationProgress: (stationProgress) => set({ stationProgress }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  updateRoomProgress: (progress) => {
    const current = get().roomProgress
    const filtered = current.filter(p => p.id !== progress.id)
    set({ roomProgress: [...filtered, progress] })
  },

  updateStationProgress: (progress) => {
    const current = get().stationProgress
    const filtered = current.filter(p => p.id !== progress.id)
    set({ stationProgress: [...filtered, progress] })
  },

  getRoomCompletionPercentage: () => {
    const progress = get().roomProgress
    if (progress.length === 0) return 0
    const completed = progress.filter(p => p.completion_status === 'completed').length
    return Math.round((completed / progress.length) * 100)
  },

  getStationCompletionPercentage: () => {
    const progress = get().stationProgress
    if (progress.length === 0) return 0
    const completed = progress.filter(p => p.completion_status === 'completed').length
    return Math.round((completed / progress.length) * 100)
  },
}))
