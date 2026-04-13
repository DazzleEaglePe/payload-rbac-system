'use client'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../auth/context/AuthProvider'
import { usePermissions } from '../../permissions/hooks/usePermissions'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { SidebarNav } from './SidebarNav'
import type { SidebarMode } from './sidebar-config'

export function MobileSidebar() {
  const { user, logout } = useAuth()
  const { hasPermission, loading } = usePermissions(user?.id, user?.role)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="md:hidden flex items-center justify-between h-12 px-4 border-b border-zinc-800/60 bg-zinc-950 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-foreground" onClick={() => setOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>
          <Logo size="sm" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Allsavfe</span>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-70 p-0 bg-zinc-950 border-zinc-800/60">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <div className="h-14 flex items-center gap-3 px-4">
            <Logo />
            <span className="text-sm font-semibold tracking-tight text-foreground">Allsavfe</span>
          </div>
          <Separator className="bg-zinc-800/60" />
          <SidebarNav
            collapsed={false}
            user={user}
            hasPermission={hasPermission}
            loading={loading}
            pathname={pathname}
            logout={logout}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { hasPermission, loading } = usePermissions(user?.id, user?.role)
  const pathname = usePathname()
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('hover')
  const [isHovering, setIsHovering] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const collapsed = sidebarMode === 'collapsed' || (sidebarMode === 'hover' && !isHovering && !dropdownOpen)

  const handleMouseEnter = useCallback(() => {
    if (sidebarMode !== 'hover') return
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHovering(true)
  }, [sidebarMode])

  const handleMouseLeave = useCallback(() => {
    if (sidebarMode !== 'hover') return
    if (dropdownOpen) return
    hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 200)
  }, [sidebarMode, dropdownOpen])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'relative h-full flex-col justify-between hidden md:flex shrink-0 bg-zinc-950 transition-[width] duration-300 ease-in-out overflow-hidden',
          'border-r border-zinc-800/60',
          collapsed ? 'w-15' : 'w-60',
        )}
      >
        <div className={cn('h-14 flex items-center shrink-0', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
          <Logo />
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap">Allsavfe</span>
          )}
        </div>
        <Separator className="bg-zinc-800/60" />

        <SidebarNav
          collapsed={collapsed}
          user={user}
          hasPermission={hasPermission}
          loading={loading}
          pathname={pathname}
          logout={logout}
          sidebarMode={sidebarMode}
          onSidebarModeChange={setSidebarMode}
          onDropdownOpenChange={setDropdownOpen}
        />
      </aside>
    </TooltipProvider>
  )
}
