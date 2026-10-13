import { create } from 'zustand'
import { Project } from '@/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null

  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  createProject: (title: string, description: string) => Promise<Project>
}

export const useProject = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  createProject: async (title: string, description: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: 'user_1',
      title,
      description,
      created_at: Date.now(),
    }
    set({
      projects: [...get().projects, newProject],
      currentProject: newProject
    })
    return newProject
  },
}))
