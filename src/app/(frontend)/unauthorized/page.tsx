'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useAuth } from '../../../features/auth/context/AuthProvider'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power4.out' }
      )
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div ref={containerRef} className="max-w-sm w-full text-center">
        <h1 className="text-4xl font-bold text-foreground">403</h1>
        <h2 className="text-lg font-medium text-foreground mt-2">Acceso Denegado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          No tienes permisos para acceder a este módulo.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button asChild>
            <Link href="/">Ir al Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
