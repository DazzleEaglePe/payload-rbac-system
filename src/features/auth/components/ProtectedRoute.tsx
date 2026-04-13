'use client'
import { useAuth } from '../context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
        <p className="text-sm font-medium animate-pulse text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
