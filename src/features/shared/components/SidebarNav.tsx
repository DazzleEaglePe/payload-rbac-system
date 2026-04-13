'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { MAIN_NAV, MODULES_NAV, BOTTOM_NAV, type SidebarMode } from './sidebar-config'
import { SidebarSearch } from './SidebarSearch'
import { SidebarChangelogCard } from './SidebarChangelogCard'
import { SidebarUser } from './SidebarUser'
import type { Module, Operation } from '@/features/shared/types'

function ActiveBar() {
  return (
    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 rounded-r-full bg-foreground" />
  )
}

export function SidebarNav({
  collapsed,
  user,
  hasPermission,
  loading,
  pathname,
  logout,
  sidebarMode,
  onSidebarModeChange,
  onDropdownOpenChange,
  onNavigate,
}: {
  collapsed: boolean
  user: { id?: string; nombre?: string; email?: string; role?: string } | null
  hasPermission: (module: Module, action: Operation) => boolean
  loading: boolean
  pathname: string
  logout: () => void
  sidebarMode?: SidebarMode
  onSidebarModeChange?: (mode: SidebarMode) => void
  onDropdownOpenChange?: (open: boolean) => void
  onNavigate?: () => void
}) {
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current.querySelectorAll('[data-nav-item]'),
        { x: -6, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.2, stagger: 0.03, ease: 'power2.out' },
      )
    }
  }, [loading, collapsed])

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    module: string | null
    shortcut?: string
    badge?: number | null
  }) => {
    const active = isActive(item.href)
    const Icon = item.icon

    const link = (
      <Link href={item.href} onClick={onNavigate} data-nav-item>
        <div
          className={cn(
            'relative group flex items-center h-9 rounded-lg text-[13px] transition-all duration-150',
            collapsed ? 'justify-center w-10 mx-auto' : 'gap-3 px-3 mx-2',
            active
              ? 'bg-white/6 text-foreground font-medium'
              : 'text-zinc-400 hover:text-foreground hover:bg-white/4',
          )}
        >
          {active && !collapsed && <ActiveBar />}
          <Icon className={cn('w-4 h-4 shrink-0', active && 'text-foreground')} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.name}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="flex items-center justify-center min-w-4.5 h-4.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-semibold px-1">
                  {item.badge}
                </span>
              )}
              {item.shortcut && !item.badge && <Kbd>{item.shortcut}</Kbd>}
            </>
          )}
        </div>
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-medium text-xs flex items-center gap-2">
            {item.name}
            {item.badge != null && item.badge > 0 && (
              <span className="flex items-center justify-center min-w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-semibold px-1">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      )
    }
    return <div key={item.href}>{link}</div>
  }

  const visibleModules = MODULES_NAV.filter(
    (item) => !item.module || loading || hasPermission(item.module as Module, 'canRead') || user?.role === 'admin',
  )

  return (
    <div ref={navRef} className="flex flex-col h-full overflow-hidden">
      <SidebarSearch collapsed={collapsed} />

      <div className="pt-2 space-y-0.5">
        {!collapsed && (
          <p className="px-5 pb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.08em]">
            General
          </p>
        )}
        {MAIN_NAV.map(renderNavItem)}
      </div>

      {visibleModules.length > 0 && (
        <div className="pt-4 space-y-0.5">
          {!collapsed ? (
            <p className="px-5 pb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.08em]">
              Módulos
            </p>
          ) : (
            <div className="px-3"><Separator className="bg-zinc-800/60" /></div>
          )}
          {visibleModules.map(renderNavItem)}
        </div>
      )}

      <div className="flex-1" />

      {!collapsed && <SidebarChangelogCard />}

      <div className="px-1 pb-1 space-y-0.5">
        {!collapsed ? (
          <div className="px-2"><Separator className="bg-zinc-800/60 mb-2" /></div>
        ) : (
          <div className="px-3"><Separator className="bg-zinc-800/60 mb-2" /></div>
        )}

        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon
          const btn = (
            <button
              key={item.name}
              className={cn(
                'flex items-center h-8 rounded-lg text-[13px] text-zinc-500 hover:text-foreground hover:bg-white/4 transition-all',
                collapsed ? 'justify-center w-10 mx-auto' : 'gap-3 px-3 mx-2 w-[calc(100%-16px)]',
              )}
              data-nav-item
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
                </>
              )}
            </button>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="text-xs">{item.name}</TooltipContent>
              </Tooltip>
            )
          }
          return <div key={item.name}>{btn}</div>
        })}
      </div>

      <SidebarUser
        collapsed={collapsed}
        user={user}
        logout={logout}
        sidebarMode={sidebarMode}
        onSidebarModeChange={onSidebarModeChange}
        onDropdownOpenChange={onDropdownOpenChange}
      />
    </div>
  )
}
