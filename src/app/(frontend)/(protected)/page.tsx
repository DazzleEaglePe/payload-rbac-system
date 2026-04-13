'use client'
import React from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Activity, ShieldCheck, Clock, LayoutGrid, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power3.out' },
      )
    }
  }, [])

  const stats = [
    { title: 'Sistema', value: 'Online', description: 'Estado actual', icon: Activity, accent: 'text-emerald-400' },
    { title: 'Rol', value: user?.role || '—', description: 'Nivel de acceso', icon: ShieldCheck, accent: 'text-blue-400' },
    { title: 'Último ingreso', value: 'Hoy', description: 'Sesión activa', icon: Clock, accent: 'text-amber-400' },
    { title: 'Módulos', value: '3', description: 'Disponibles', icon: LayoutGrid, accent: 'text-violet-400' },
  ]

  return (
    <div className="flex flex-col gap-6" ref={containerRef}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Panel de control{user?.role === 'admin' ? ' administrativo' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.accent}`} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold capitalize">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-3 p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Control de acceso</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Tu nivel de acceso es <span className="text-foreground font-medium">{user?.role}</span>. Los módulos visibles en la barra lateral corresponden a los permisos asignados a tu cuenta. Selecciona un módulo para comenzar.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
