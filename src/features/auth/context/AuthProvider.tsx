'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth.service'
import { useRouter } from 'next/navigation'
import type { AppUser } from '@/features/shared/types'

interface AuthContextType {
  user: AppUser | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData || null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    try {
      const data = await authService.login(email, pass)
      setUser(data.user)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
