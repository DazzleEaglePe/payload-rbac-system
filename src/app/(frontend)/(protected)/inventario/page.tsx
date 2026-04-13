'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../features/auth/context/AuthProvider'
import { usePermissions } from '../../../../features/permissions/hooks/usePermissions'
import { useInventory } from '../../../../features/inventory/hooks/useInventory'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, AlertTriangle, Search, Download, X, DollarSign } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { InventoryTable } from '@/features/inventory/components/InventoryTable'
import { InventoryTableSkeleton } from '@/features/inventory/components/InventoryTableSkeleton'
import { InventoryDialogs } from '@/features/inventory/components/InventoryDialogs'
import { exportInventoryCSV } from '@/features/inventory/utils/export-csv'
import { inventoryService } from '@/features/inventory/services/inventory.service'
import type { PriceRange } from '@/features/inventory/services/inventory.service'
import type { InventoryItem, CreateInventoryItemDTO } from '@/features/shared/types'

const PRICE_MAX = 10000

const SORT_LABELS: Record<string, string> = {
  '-createdAt': 'Más recientes',
  'createdAt': 'Más antiguos',
  '-stock': 'Mayor stock',
  'stock': 'Menor stock',
  '-precio': 'Mayor precio',
  'precio': 'Menor precio',
}

export default function InventarioPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('-createdAt')
  const [priceSlider, setPriceSlider] = useState<[number, number]>([0, PRICE_MAX])
  const [debouncedPrice, setDebouncedPrice] = useState<PriceRange | undefined>(undefined)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handlePriceChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]]
    setPriceSlider(range)
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current)
    priceTimerRef.current = setTimeout(() => {
      const isDefault = range[0] === 0 && range[1] === PRICE_MAX
      setDebouncedPrice(isDefault ? undefined : range)
      setPage(1)
    }, 400)
  }

  const { user } = useAuth()
  const { hasPermission, loading: permsLoading } = usePermissions(user?.id, user?.role)
  const { items, loading, error, totalPages, totalDocs, createItem, updateItem, deleteItem } = useInventory(page, limit, debouncedSearch, sort, debouncedPrice)
  const router = useRouter()

  useEffect(() => {
    if (!permsLoading && user?.role !== 'admin' && !hasPermission('inventario', 'canRead')) {
      router.replace('/unauthorized')
    }
  }, [permsLoading, hasPermission, user, router])

  useEffect(() => { setSelected(new Set()) }, [page])

  if (permsLoading || (user?.role !== 'admin' && !hasPermission('inventario', 'canRead'))) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
  }

  const canCreate = user?.role === 'admin' || hasPermission('inventario', 'canCreate')
  const canUpdate = user?.role === 'admin' || hasPermission('inventario', 'canUpdate')
  const canDelete = user?.role === 'admin' || hasPermission('inventario', 'canDelete')

  const allSelected = items.length > 0 && selected.size === items.length
  const someSelected = selected.size > 0 && selected.size < items.length

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))
  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  const filteredItems = items

  const hasActiveFilters = debouncedSearch || debouncedPrice !== undefined || sort !== '-createdAt'

  const clearAllFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setPriceSlider([0, PRICE_MAX])
    setDebouncedPrice(undefined)
    setSort('-createdAt')
    setPage(1)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await inventoryService.exportAll(debouncedSearch, sort, debouncedPrice)
      exportInventoryCSV(data)
      toast.success('Exportación completada', { description: `${data.length} productos exportados a CSV.` })
    } catch {
      toast.error('Error al exportar', { description: 'No se pudo generar el archivo CSV.' })
    } finally {
      setExporting(false)
    }
  }

  const handleCreate = async (data: CreateInventoryItemDTO) => {
    setFormLoading(true)
    try {
      await createItem(data)
      setCreateOpen(false)
      toast.success('Producto creado exitosamente', {
        description: `${data.nombre} (${data.sku}) se agregó al inventario.`,
      })
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
    } catch (err: unknown) {
      toast.error('Error al crear producto', { description: err instanceof Error ? err.message : 'Error desconocido' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (data: CreateInventoryItemDTO) => {
    if (!editItem) return
    setFormLoading(true)
    try {
      await updateItem(editItem.id, data)
      setEditItem(null)
      toast.success('Producto actualizado', {
        description: `${data.nombre} se actualizó correctamente.`,
      })
    } catch (err: unknown) {
      toast.error('Error al actualizar', { description: err instanceof Error ? err.message : 'Error desconocido' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setFormLoading(true)
    const name = deleteTarget.nombre
    try {
      await deleteItem(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Producto eliminado', { description: `${name} fue removido del inventario.` })
    } catch (err: unknown) {
      toast.error('Error al eliminar', { description: err instanceof Error ? err.message : 'Error desconocido' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    setFormLoading(true)
    const count = selected.size
    try {
      for (const id of selected) {
        await deleteItem(id)
      }
      setSelected(new Set())
      setBulkDeleteOpen(false)
      toast.success(`${count} producto(s) eliminados`, { description: 'La operación se completó correctamente.' })
    } catch (err: unknown) {
      toast.error('Error en eliminación masiva', { description: err instanceof Error ? err.message : 'Error desconocido' })
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los productos de tu almacén.{totalDocs > 0 && <> <span className="text-foreground font-medium">{totalDocs}</span> productos registrados.</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar
          </Button>
          {canCreate && (
            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {loading && debouncedSearch && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-3 min-w-[260px]">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <Slider
            min={0}
            max={PRICE_MAX}
            step={50}
            value={priceSlider}
            onValueChange={handlePriceChange}
            className="flex-1"
          />
          <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap min-w-[100px] text-right">
            ${priceSlider[0].toLocaleString()} – ${priceSlider[1].toLocaleString()}
          </span>
        </div>
        {canDelete && selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20">
            <span className="text-sm text-destructive font-medium">{selected.size} seleccionado(s)</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={formLoading}
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {debouncedSearch && (
            <Badge variant="secondary" className="gap-1 pr-1 font-normal">
              Búsqueda: &ldquo;{debouncedSearch}&rdquo;
              <button onClick={() => { setSearchQuery(''); setDebouncedSearch('') }} className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {debouncedPrice !== undefined && (
            <Badge variant="secondary" className="gap-1 pr-1 font-normal">
              Precio: ${debouncedPrice[0].toLocaleString()} – ${debouncedPrice[1].toLocaleString()}
              <button onClick={() => { setPriceSlider([0, PRICE_MAX]); setDebouncedPrice(undefined) }} className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {sort !== '-createdAt' && (
            <Badge variant="secondary" className="gap-1 pr-1 font-normal">
              Orden: {SORT_LABELS[sort]}
              <button onClick={() => setSort('-createdAt')} className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Limpiar filtros
          </button>
        </div>
      )}

      {error ? (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Error al cargar el inventario</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
          </div>
        </Card>
      ) : loading ? (
        <InventoryTableSkeleton rows={limit} />
      ) : (
        <InventoryTable
          items={items}
          filteredItems={filteredItems}
          selected={selected}
          searchQuery={searchQuery}
          loading={loading}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          allSelected={allSelected}
          someSelected={someSelected}
          page={page}
          totalPages={totalPages}
          limit={limit}
          totalDocs={totalDocs}
          sort={sort}
          onSortChange={(s) => { setSort(s); setPage(1) }}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onEdit={setEditItem}
          onDelete={setDeleteTarget}
          onCreateClick={() => setCreateOpen(true)}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <InventoryDialogs
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
        editItem={editItem}
        onEditItemChange={setEditItem}
        deleteTarget={deleteTarget}
        onDeleteTargetChange={setDeleteTarget}
        bulkDeleteOpen={bulkDeleteOpen}
        onBulkDeleteOpenChange={setBulkDeleteOpen}
        selectedCount={selected.size}
        formLoading={formLoading}
        onCreateSubmit={handleCreate}
        onUpdateSubmit={handleUpdate}
        onDeleteConfirm={handleDelete}
        onBulkDeleteConfirm={handleBulkDelete}
      />
    </div>
  )
}
