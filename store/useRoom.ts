import { create } from 'zustand'
import { Room, Station, RoomProgress } from '@/types'

interface RoomState {
  rooms: Room[]
  currentRoom: Room | null
  currentStations: Station[]
  roomProgress: RoomProgress[]
  loading: boolean
  error: string | null

  setRooms: (rooms: Room[]) => void
  setCurrentRoom: (room: Room | null) => void
  setCurrentStations: (stations: Station[]) => void
  setRoomProgress: (progress: RoomProgress[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useRoom = create<RoomState>((set) => ({
  rooms: [],
  currentRoom: null,
  currentStations: [],
  roomProgress: [],
  loading: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setCurrentStations: (currentStations) => set({ currentStations }),
  setRoomProgress: (roomProgress) => set({ roomProgress }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
