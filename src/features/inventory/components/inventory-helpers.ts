export type StockBadgeResult = {
  label: string
  variant: 'destructive' | 'secondary'
  className?: string
}

export function getStockBadge(stock: number): StockBadgeResult {
  if (stock === 0) return { label: 'Sin stock', variant: 'destructive' }
  if (stock <= 10) return { label: 'Bajo', variant: 'secondary', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25' }
  if (stock <= 50) return { label: 'Normal', variant: 'secondary', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/25' }
  return { label: 'Alto', variant: 'secondary', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25' }
}
