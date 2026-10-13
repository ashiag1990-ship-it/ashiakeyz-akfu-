'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { RoomView } from '@/components/RoomView'
import { useRoom } from '@/store/useRoom'
import { useProgress } from '@/store/useProgress'
import { getRoom, getRoomProgress } from '@/lib/api'
import { Room, Station } from '@/types'
import { useParams } from 'next/navigation'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  const [room, setRoom] = useState<Room | null>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)

  const { setRooms, setCurrentRoom, setCurrentStations } = useRoom()
  const { setRoomProgress } = useProgress()

  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const roomData = await getRoom(roomId)
        setRoom(roomData)
        setCurrentRoom(roomData)

        if (roomData.id) {
          // Extract stations from room data
          if (roomData.stations) {
            setStations(roomData.stations)
            setCurrentStations(roomData.stations)
          }

          // Load progress
          const currentProject = localStorage.getItem('currentProjectId') || 'project_1'
          try {
            const progress = await getRoomProgress(currentProject)
            if (progress) {
              setRoomProgress(progress)
            }
          } catch {
            console.error('Failed to load progress')
          }
        }
      } catch (error) {
        console.error('Failed to load room:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRoomData()
  }, [roomId, setRooms, setCurrentRoom, setCurrentStations, setRoomProgress])

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen bg-akfu-dark flex items-center justify-center">
            <div className="text-gray-400">Loading room...</div>
          </main>
        </div>
      </>
    )
  }

  if (!room) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen bg-akfu-dark flex items-center justify-center">
            <div className="text-gray-400">Room not found</div>
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
          <RoomView room={room} stations={stations} />
        </main>
      </div>
    </>
  )
}
