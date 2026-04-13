'use client'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface InventoryPaginationProps {
  page: number
  totalPages: number
  limit: number
  totalDocs: number
  selectedCount: number
  itemsCount: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function InventoryPagination({
  page,
  totalPages,
  limit,
  totalDocs,
  selectedCount,
  itemsCount,
  onPageChange,
  onLimitChange,
}: InventoryPaginationProps) {
  const startRow = (page - 1) * limit + 1
  const endRow = Math.min(page * limit, totalDocs)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        {selectedCount > 0
          ? <>{selectedCount} de {itemsCount} fila(s) seleccionada(s).</>
          : <>{startRow}-{endRow} de {totalDocs} producto(s).</>}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Filas</span>
          <Select value={limit.toString()} onValueChange={(v) => { onLimitChange(Number(v)); onPageChange(1) }}>
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange(1)}>
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => onPageChange(totalPages)}>
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
