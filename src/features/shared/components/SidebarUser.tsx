'use client'
import {
  LogOut, User, Bell, CreditCard as BillingIcon,
  ChevronsLeft, ChevronsRight, PanelLeft,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import type { SidebarMode } from './sidebar-config'

export function SidebarUser({
  collapsed,
  user,
  logout,
  sidebarMode,
  onSidebarModeChange,
  onDropdownOpenChange,
}: {
  collapsed: boolean
  user: { id?: string; nombre?: string; email?: string; role?: string } | null
  logout: () => void
  sidebarMode?: SidebarMode
  onSidebarModeChange?: (mode: SidebarMode) => void
  onDropdownOpenChange?: (open: boolean) => void
}) {
  return (
    <div className="p-2 border-t border-zinc-800/60">
      <DropdownMenu onOpenChange={onDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-10 mx-auto flex justify-center py-1.5 rounded-lg hover:bg-white/4 transition-all focus:outline-none">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xs font-bold text-foreground ring-1 ring-white/8">
                      {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-xs">
                {user?.nombre || 'Usuario'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/4 transition-all focus:outline-none group">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xs font-bold text-foreground ring-1 ring-white/8">
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-[13px] font-medium text-foreground truncate">{user?.nombre || 'Usuario'}</span>
                <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
              </div>
              <ChevronsLeft className="w-3.5 h-3.5 shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-60 rounded-xl"
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'end' : 'start'}
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3 py-0.5">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xs font-bold text-foreground ring-1 ring-white/8">
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{user?.nombre || 'Usuario'}</span>
                <span className="text-xs text-zinc-500 truncate">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="gap-3">
              <User className="w-4 h-4 text-zinc-400" />
              Cuenta
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3">
              <BillingIcon className="w-4 h-4 text-zinc-400" />
              Facturación
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span className="flex-1">Notificaciones</span>
              <span className="flex items-center justify-center min-w-4.5 h-4.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-semibold px-1">2</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {onSidebarModeChange && (
            <>
              <DropdownMenuLabel className="text-[10px] text-zinc-600 font-normal uppercase tracking-wider">
                Sidebar
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sidebarMode} onValueChange={(v) => onSidebarModeChange(v as SidebarMode)}>
                <DropdownMenuRadioItem value="expanded" className="text-[13px] gap-3">
                  <ChevronsRight className="w-3.5 h-3.5 text-zinc-400" />
                  Expandida
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="collapsed" className="text-[13px] gap-3">
                  <ChevronsLeft className="w-3.5 h-3.5 text-zinc-400" />
                  Colapsada
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="hover" className="text-[13px] gap-3">
                  <PanelLeft className="w-3.5 h-3.5 text-zinc-400" />
                  Expandir al pasar
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={logout} className="gap-3 text-red-400 focus:text-red-400 focus:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
