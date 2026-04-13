'use client'
import { useRef, useEffect } from 'react'
import {
  Plus, Trash2, Edit, MoreHorizontal, Package, ImageOff,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getStockBadge } from './inventory-helpers'
import { InventoryPagination } from './InventoryPagination'
import type { InventoryItem, MediaItem } from '@/features/shared/types'

function getImageUrl(media: MediaItem): string {
  return media.cloudinaryUrl || media.url || `/api/media/file/${media.filename}`
}

interface InventoryTableProps {
  items: InventoryItem[]
  filteredItems: InventoryItem[]
  selected: Set<string>
  searchQuery: string
  loading: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  allSelected: boolean
  someSelected: boolean
  page: number
  totalPages: number
  limit: number
  totalDocs: number
  sort: string
  onSortChange: (sort: string) => void
  onToggleAll: () => void
  onToggleOne: (id: string) => void
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onCreateClick: () => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function InventoryTable({
  items,
  filteredItems,
  selected,
  searchQuery,
  loading,
  canCreate,
  canUpdate,
  canDelete,
  allSelected,
  someSelected,
  page,
  totalPages,
  limit,
  totalDocs,
  sort,
  onSortChange,
  onToggleAll,
  onToggleOne,
  onEdit,
  onDelete,
  onCreateClick,
  onPageChange,
  onLimitChange,
}: InventoryTableProps) {
  const tableRef = useRef<HTMLTableSectionElement>(null)

  const getSortIcon = (field: string) => {
    if (sort === field) return <ArrowUp className="w-3.5 h-3.5" />
    if (sort === `-${field}`) return <ArrowDown className="w-3.5 h-3.5" />
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
  }

  const handleSort = (field: string) => {
    if (sort === field) onSortChange(`-${field}`)
    else if (sort === `-${field}`) onSortChange('-createdAt')
    else onSortChange(field)
  }

  useEffect(() => {
    if (!loading && filteredItems.length > 0 && tableRef.current) {
      gsap.fromTo(
        tableRef.current.children,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out' },
      )
    }
  }, [loading, filteredItems, searchQuery])

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 pl-4">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={onToggleAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="w-14"></TableHead>
            <TableHead className="font-medium">Producto</TableHead>
            <TableHead className="font-medium">SKU</TableHead>
            <TableHead className="font-medium">Estado</TableHead>
            <TableHead className="font-medium text-right">
              <button onClick={() => handleSort('stock')} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                Stock {getSortIcon('stock')}
              </button>
            </TableHead>
            <TableHead className="font-medium text-right">
              <button onClick={() => handleSort('precio')} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                Precio {getSortIcon('precio')}
              </button>
            </TableHead>
            {(canUpdate || canDelete) && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody ref={tableRef}>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="w-8 h-8" />
                  <p className="text-sm">
                    {searchQuery ? 'No se encontraron productos con ese criterio.' : 'No hay productos en el inventario.'}
                  </p>
                  {canCreate && !searchQuery && (
                    <Button size="sm" variant="outline" className="mt-1 gap-1.5" onClick={onCreateClick}>
                      <Plus className="w-3.5 h-3.5" /> Crear primer producto
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => {
              const badge = getStockBadge(item.stock)
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    'opacity-0 group/row',
                    selected.has(item.id) && 'bg-muted/40',
                  )}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => onToggleOne(item.id)}
                      aria-label={`Seleccionar ${item.nombre}`}
                    />
                  </TableCell>
                  <TableCell>
                    {item.imagenes && item.imagenes.length > 0 && typeof item.imagenes[0] === 'object' ? (
                      <div className="w-9 h-9 rounded-md overflow-hidden bg-muted/50 border">
                        <img
                          src={getImageUrl(item.imagenes[0] as MediaItem)}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-muted/30 border border-dashed flex items-center justify-center">
                        <ImageOff className="w-3.5 h-3.5 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-[13px]">{item.nombre}</span>
                      {item.descripcion && (
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{item.descripcion}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.sku}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badge.variant} className={cn('text-[11px] font-medium gap-1.5', badge.className)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{item.stock.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">${item.precio.toFixed(2)}</TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2">
                              <Edit className="w-3.5 h-3.5" /> Editar
                            </DropdownMenuItem>
                          )}
                          {canUpdate && canDelete && <DropdownMenuSeparator />}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <InventoryPagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        totalDocs={totalDocs}
        selectedCount={selected.size}
        itemsCount={items.length}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </Card>
  )
}
