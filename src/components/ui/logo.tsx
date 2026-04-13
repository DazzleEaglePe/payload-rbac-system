import { cn } from '@/lib/utils'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 rounded-lg blur-sm" />
      <div className="relative bg-zinc-900 rounded-lg p-1.5 ring-1 ring-white/8">
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={cn(s, 'text-foreground')}
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
      </div>
    </div>
  )
}
