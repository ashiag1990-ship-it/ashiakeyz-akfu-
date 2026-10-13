'use client'

import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { CampusMap } from '@/components/CampusMap'
import { useRoom } from '@/store/useRoom'
import { getRooms } from '@/lib/api'

export default function CampusPage() {
  const { setRooms } = useRoom()

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms()
        setRooms(data)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      }
    }

    loadRooms()
  }, [setRooms])

  return (
    <>
      <Header />
      <CampusMap />
    </>
  )
}
