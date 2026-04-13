'use client'
import { ChevronRight, Sparkles } from 'lucide-react'

export function SidebarChangelogCard() {
  return (
    <div className="mx-3 mb-2" data-nav-item>
      <div className="rounded-xl border border-zinc-800/60 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 p-3">
        <div className="flex items-center gap-2 text-[12px] font-medium text-foreground mb-1">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Novedades v2.1
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Nuevo CRUD con animaciones y alertas de confirmación.
        </p>
        <button className="mt-2 text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors">
          Ver changelog <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
