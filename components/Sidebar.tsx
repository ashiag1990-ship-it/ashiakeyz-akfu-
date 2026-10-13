'use client'

import { useRoom } from '@/store/useRoom'
import Link from 'next/link'

export function Sidebar() {
  const { rooms, currentRoom } = useRoom()

  return (
    <aside className="w-64 bg-akfu-purple border-r border-akfu-cyan">
      <div className="p-4">
        <h3 className="text-akfu-cyan font-bold mb-4">Rooms</h3>
        <nav className="space-y-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className={`block px-3 py-2 rounded transition ${
                currentRoom?.id === room.id
                  ? 'bg-akfu-cyan text-akfu-dark font-bold'
                  : 'text-gray-300 hover:bg-akfu-dark hover:text-akfu-cyan'
              }`}
            >
              {room.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-akfu-cyan p-4">
        <h4 className="text-akfu-gold font-bold text-sm mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/" className="text-gray-400 hover:text-akfu-cyan transition">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/campus" className="text-gray-400 hover:text-akfu-cyan transition">
              Campus Map
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  )
}
