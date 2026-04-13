import type { InventoryItem } from '@/features/shared/types'
import { getStockBadge } from '../components/inventory-helpers'

export function exportInventoryCSV(items: InventoryItem[]) {
  const headers = ['Nombre', 'SKU', 'Precio (USD)', 'Stock', 'Estado', 'Descripción', 'Fecha de creación']

  const rows = items.map((item) => [
    item.nombre,
    item.sku,
    item.precio.toFixed(2),
    String(item.stock),
    getStockBadge(item.stock).label,
    item.descripcion?.replace(/[\n\r]+/g, ' ') ?? '',
    new Date(item.createdAt).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  ])

  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\r\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const today = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventario_${today}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
