import { create } from 'zustand'

interface User {
    id: number
    username: string
    full_name: string
    role: string
    email: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    login: (user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (user) => {
        set({ user, isAuthenticated: true })
    },
    logout: () => {
        set({ user: null, isAuthenticated: false })
    },
}))


interface UIState {
    sidebarCollapsed: boolean
    toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
