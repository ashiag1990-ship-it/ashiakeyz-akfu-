'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { useProject } from '@/store/useProject'
import { useRoom } from '@/store/useRoom'
import { getRooms } from '@/lib/api'
import Link from 'next/link'

export default function Dashboard() {
  const { projects, currentProject, createProject } = useProject()
  const { rooms, setRooms } = useRoom()
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms()
        setRooms(data)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [setRooms])

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return

    await createProject(newProjectTitle, newProjectDesc)
    setNewProjectTitle('')
    setNewProjectDesc('')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-akfu-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <section className="mb-16">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-akfu-cyan to-akfu-gold bg-clip-text text-transparent">
              AKFU
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Ashia Keyz Film University — An AI-powered interactive platform for learning film creation,
              music production, and creative storytelling.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Projects */}
            <div className="lg:col-span-1">
              <div className="bg-akfu-purple border border-akfu-purple rounded-lg p-6">
                <h2 className="text-2xl font-bold text-akfu-cyan mb-6">Your Projects</h2>

                {/* Create New Project */}
                <div className="mb-6 p-4 bg-akfu-dark rounded border border-akfu-purple">
                  <input
                    type="text"
                    placeholder="Project name..."
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full bg-akfu-dark border border-akfu-purple rounded px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-akfu-cyan"
                  />
                  <textarea
                    placeholder="Description..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full bg-akfu-dark border border-akfu-purple rounded px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-akfu-cyan resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleCreateProject}
                    className="w-full px-3 py-2 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded text-sm hover:shadow-lg hover:shadow-akfu-cyan/50 transition"
                  >
                    New Project
                  </button>
                </div>

                {/* Project List */}
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <p className="text-gray-400 text-sm">No projects yet. Create one to start!</p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-4 rounded border transition cursor-pointer ${
                          currentProject?.id === project.id
                            ? 'bg-akfu-cyan/20 border-akfu-cyan'
                            : 'bg-akfu-dark border-akfu-purple hover:border-akfu-cyan'
                        }`}
                      >
                        <p className="font-bold text-white text-sm">{project.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{project.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Rooms Overview */}
            <div className="lg:col-span-2">
              <div className="bg-akfu-purple border border-akfu-purple rounded-lg p-6">
                <h2 className="text-2xl font-bold text-akfu-cyan mb-6">Campus Rooms</h2>

                {loading ? (
                  <div className="text-center text-gray-400">Loading rooms...</div>
                ) : rooms.length === 0 ? (
                  <div className="text-center text-gray-400">No rooms available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.map((room) => (
                      <Link
                        key={room.id}
                        href={`/room/${room.id}`}
                        className="group p-4 bg-akfu-dark border border-akfu-purple rounded hover:border-akfu-cyan hover:bg-akfu-purple/50 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-white group-hover:text-akfu-cyan transition">
                            {room.title}
                          </h3>
                          <span className="px-2 py-1 bg-akfu-cyan/20 text-akfu-cyan text-xs rounded font-bold">
                            {room.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{room.description}</p>
                        <p className="text-xs text-akfu-gold mt-2">{room.department}</p>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href="/campus"
                  className="mt-6 block w-full px-4 py-3 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded text-center hover:shadow-lg hover:shadow-akfu-cyan/50 transition"
                >
                  View Campus Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
