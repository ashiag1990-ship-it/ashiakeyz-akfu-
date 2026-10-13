'use client'

import { useRouter } from 'next/navigation'
import { useRoom } from '@/store/useRoom'
import { useState } from 'react'

interface Building {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
}

export function CampusMap() {
  const router = useRouter()
  const { rooms, setCurrentRoom } = useRoom()
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null)

  const buildings: Building[] = [
    { id: 'welcome-hub', name: 'Welcome Hub', x: 50, y: 50, width: 80, height: 60 },
    { id: 'sound-lab', name: 'Sound Lab', x: 180, y: 50, width: 80, height: 60 },
    { id: 'visual-studio', name: 'Visual Studio', x: 310, y: 50, width: 80, height: 60 },
    { id: 'edit-suite', name: 'Edit Suite', x: 440, y: 50, width: 80, height: 60 },
    { id: 'graphics-lab', name: 'Graphics Lab', x: 570, y: 50, width: 80, height: 60 },
    { id: 'vfx-studio', name: 'VFX Studio', x: 700, y: 50, width: 80, height: 60 },
    { id: 'script-room', name: 'Script Room', x: 50, y: 150, width: 80, height: 60 },
    { id: 'color-grading', name: 'Color Grading', x: 180, y: 150, width: 80, height: 60 },
    { id: 'motion-capture', name: 'Motion Capture', x: 310, y: 150, width: 80, height: 60 },
    { id: 'studio-a', name: 'Studio A', x: 440, y: 150, width: 80, height: 60 },
    { id: 'studio-b', name: 'Studio B', x: 570, y: 150, width: 80, height: 60 },
    { id: 'theater', name: 'Theater', x: 700, y: 150, width: 80, height: 60 },
  ]

  const handleBuildingClick = (buildingId: string) => {
    const room = rooms.find((r) => r.slug === buildingId)
    if (room) {
      setCurrentRoom(room)
      router.push(`/room/${room.id}`)
    }
  }

  return (
    <div className="w-full h-screen bg-akfu-dark flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-akfu-cyan to-akfu-gold bg-clip-text text-transparent">
          AKFU Campus Map
        </h1>

        <svg
          viewBox="0 0 820 250"
          className="w-full border border-akfu-purple rounded-lg"
          style={{ backgroundColor: '#0A0E27' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2D1B4E" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="820" height="250" fill="url(#grid)" />

          {/* Buildings */}
          {buildings.map((building) => (
            <g key={building.id}>
              <rect
                x={building.x}
                y={building.y}
                width={building.width}
                height={building.height}
                fill={hoveredBuilding === building.id ? '#00D9FF' : '#2D1B4E'}
                stroke={hoveredBuilding === building.id ? '#D4AF37' : '#00D9FF'}
                strokeWidth="2"
                rx="4"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredBuilding(building.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => handleBuildingClick(building.id)}
              />
              <text
                x={building.x + building.width / 2}
                y={building.y + building.height / 2 + 2}
                textAnchor="middle"
                className="text-xs font-bold fill-akfu-dark pointer-events-none select-none"
                fontSize="10"
              >
                {building.name.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Click on a building to enter. {rooms.length} rooms available.
        </p>
      </div>
    </div>
  )
}
