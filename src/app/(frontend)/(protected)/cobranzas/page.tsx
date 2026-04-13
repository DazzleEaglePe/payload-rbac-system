'use client'
import { useEffect, useRef } from 'react'
import { useAuth } from '../../../../features/auth/context/AuthProvider'
import { usePermissions } from '../../../../features/permissions/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { Loader2, Clock, CircleDollarSign, AlertTriangle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CobranzasPage() {
  const { user } = useAuth()
  const { hasPermission, loading: permsLoading } = usePermissions(user?.id, user?.role)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!permsLoading && user?.role !== 'admin' && !hasPermission('cobranzas', 'canRead')) {
      router.replace('/unauthorized')
    }
  }, [permsLoading, hasPermission, user, router])

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power3.out' },
      )
    }
  }, [permsLoading])

  if (permsLoading || (user?.role !== 'admin' && !hasPermission('cobranzas', 'canRead'))) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const stats = [
    { title: 'Pendientes', value: '0', icon: Clock, accent: 'text-amber-400' },
    { title: 'Cobrado', value: '$0.00', icon: CircleDollarSign, accent: 'text-emerald-400' },
    { title: 'Vencidas', value: '0', icon: AlertTriangle, accent: 'text-red-400' },
  ]

  return (
    <div className="flex flex-col gap-6" ref={containerRef}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cobranzas</h1>
        <p className="text-sm text-muted-foreground mt-1">Módulo de gestión de cobranzas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.accent}`} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col items-center justify-center min-h-60 text-center">
        <CardContent className="flex flex-col items-center gap-3 p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Sin registros de cobranzas</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Este módulo está habilitado para tu usuario. Los registros aparecerán aquí cuando estén disponibles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
