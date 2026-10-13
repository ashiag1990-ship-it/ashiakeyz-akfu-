'use client'

import { Room, Station } from '@/types'
import Link from 'next/link'
import { useState } from 'react'

interface RoomViewProps {
  room: Room
  stations: Station[]
}

export function RoomView({ room, stations }: RoomViewProps) {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-akfu-dark p-8">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-akfu-cyan to-akfu-gold bg-clip-text text-transparent">
            {room.title}
          </h1>
          <p className="text-gray-400 text-lg">{room.description}</p>
          <p className="text-akfu-gold text-sm mt-2">Department: {room.department}</p>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <Link
              key={station.id}
              href={`/station/${station.id}`}
              className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                hoveredStation === station.id
                  ? 'border-akfu-gold bg-akfu-purple shadow-lg shadow-akfu-gold/20'
                  : 'border-akfu-purple bg-akfu-purple/50 hover:border-akfu-cyan'
              }`}
              onMouseEnter={() => setHoveredStation(station.id)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <div className="p-6">
                {/* Station Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-akfu-cyan to-akfu-gold rounded-lg flex items-center justify-center mb-4">
                  <span className="text-akfu-dark font-bold">●</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{station.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{station.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-akfu-cyan">Station {station.station_order}</span>
                  <span className="px-2 py-1 bg-akfu-dark rounded text-akfu-gold">
                    {station.station_type}
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-akfu-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <span className="text-akfu-cyan font-bold text-sm">Enter Station →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 border border-akfu-purple rounded-lg bg-akfu-purple/20">
          <h3 className="text-lg font-bold text-akfu-gold mb-2">About This Room</h3>
          <p className="text-gray-400">
            This room contains {stations.length} interactive stations. Complete each station to progress
            through the AKFU curriculum and unlock new creative tools.
          </p>
        </div>
      </div>
    </div>
  )
}
