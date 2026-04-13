import type { AppUser, LoginResponse } from '@/features/shared/types'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
    return data
  },

  async logout(): Promise<boolean> {
    const res = await fetch('/api/users/logout', { method: 'POST' })
    if (!res.ok) throw new Error('Error al cerrar sesión')
    return true
  },

  async getMe(): Promise<AppUser | null> {
    const res = await fetch('/api/users/me')
    const data = await res.json()
    return data.user
  },
}
