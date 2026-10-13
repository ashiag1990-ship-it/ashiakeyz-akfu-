'use client'

import { useProject } from '@/store/useProject'
import { useProgress } from '@/store/useProgress'
import Link from 'next/link'

export function Header() {
  const { currentProject } = useProject()
  const { getRoomCompletionPercentage } = useProgress()

  const completion = getRoomCompletionPercentage()

  return (
    <header className="bg-akfu-dark border-b border-akfu-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-akfu-cyan to-akfu-gold rounded-lg flex items-center justify-center">
              <span className="text-akfu-dark font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-akfu-cyan to-akfu-gold bg-clip-text text-transparent">
              AKFU
            </span>
          </Link>

          <div className="flex-1 max-w-xs mx-8">
            {currentProject && (
              <div>
                <p className="text-sm text-gray-400">{currentProject.title}</p>
                <div className="w-full bg-akfu-purple rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-akfu-cyan to-akfu-gold h-2 rounded-full transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <nav className="flex space-x-6">
            <Link href="/campus" className="text-gray-400 hover:text-akfu-cyan transition">
              Campus
            </Link>
            <Link href="/" className="text-gray-400 hover:text-akfu-cyan transition">
              Projects
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
