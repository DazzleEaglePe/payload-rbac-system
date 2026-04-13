import {
  Package, TrendingUp, CreditCard, LayoutDashboard,
  Search, Settings, HelpCircle,
} from 'lucide-react'

export const MAIN_NAV = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, module: null, shortcut: '⌘D' },
] as const

export const MODULES_NAV = [
  { name: 'Inventario', href: '/inventario', icon: Package, module: 'inventario', shortcut: '⌘I', badge: null },
  { name: 'Ventas', href: '/ventas', icon: TrendingUp, module: 'ventas', shortcut: '⌘V', badge: 3 },
  { name: 'Cobranzas', href: '/cobranzas', icon: CreditCard, module: 'cobranzas', shortcut: '⌘C', badge: null },
] as const

export const BOTTOM_NAV = [
  { name: 'Buscar', icon: Search, shortcut: '⌘K' },
  { name: 'Configuración', icon: Settings, shortcut: null },
  { name: 'Ayuda', icon: HelpCircle, shortcut: null },
] as const

export type SidebarMode = 'expanded' | 'collapsed' | 'hover'
