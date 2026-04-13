'use client'
import { Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

export function SidebarSearch({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('px-3 pt-2 pb-1', collapsed && 'px-2')}>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="w-10 h-9 mx-auto flex items-center justify-center rounded-lg text-zinc-500 hover:text-foreground hover:bg-white/4 transition-all"
              data-nav-item
            >
              <Search className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-xs flex items-center gap-2">
            Buscar <Kbd>⌘K</Kbd>
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          className="w-full flex items-center gap-3 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-500 text-[13px] hover:border-zinc-700 hover:text-zinc-400 transition-all"
          data-nav-item
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Buscar...</span>
          <Kbd>⌘K</Kbd>
        </button>
      )}
    </div>
  )
}
