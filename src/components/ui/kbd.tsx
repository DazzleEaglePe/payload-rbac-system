export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="hidden xl:inline-flex h-5 items-center gap-0.5 rounded border border-zinc-700/60 bg-zinc-800/50 px-1.5 font-mono text-[10px] font-medium text-zinc-500">
      {children}
    </kbd>
  )
}
