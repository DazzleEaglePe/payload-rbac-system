'use client'
import {
  Edit, Trash2, Loader2, AlertTriangle, PackagePlus,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ProductForm } from './ProductForm'
import type { InventoryItem, CreateInventoryItemDTO } from '@/features/shared/types'

interface InventoryDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editItem: InventoryItem | null
  onEditItemChange: (item: InventoryItem | null) => void
  deleteTarget: InventoryItem | null
  onDeleteTargetChange: (item: InventoryItem | null) => void
  bulkDeleteOpen: boolean
  onBulkDeleteOpenChange: (open: boolean) => void
  selectedCount: number
  formLoading: boolean
  onCreateSubmit: (data: CreateInventoryItemDTO) => void
  onUpdateSubmit: (data: CreateInventoryItemDTO) => void
  onDeleteConfirm: () => void
  onBulkDeleteConfirm: () => void
}

export function InventoryDialogs({
  createOpen,
  onCreateOpenChange,
  editItem,
  onEditItemChange,
  deleteTarget,
  onDeleteTargetChange,
  bulkDeleteOpen,
  onBulkDeleteOpenChange,
  selectedCount,
  formLoading,
  onCreateSubmit,
  onUpdateSubmit,
  onDeleteConfirm,
  onBulkDeleteConfirm,
}: InventoryDialogsProps) {
  return (
    <>
      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10">
                <PackagePlus className="w-4 h-4 text-primary" />
              </div>
              Nuevo Producto
            </DialogTitle>
            <DialogDescription>Completa los datos para agregar un producto al inventario.</DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={onCreateSubmit}
            onCancel={() => onCreateOpenChange(false)}
            loading={formLoading}
            submitLabel="Crear Producto"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(v) => { if (!v) onEditItemChange(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Edit className="w-4 h-4 text-blue-400" />
              </div>
              Editar Producto
            </DialogTitle>
            <DialogDescription>Modifica los datos de <span className="font-medium text-foreground">{editItem?.nombre}</span>.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <ProductForm
              key={editItem.id}
              initial={{
                nombre: editItem.nombre,
                sku: editItem.sku,
                precio: editItem.precio,
                stock: editItem.stock,
                descripcion: editItem.descripcion ?? '',
                imagenes: editItem.imagenes ?? undefined,
              }}
              onSubmit={onUpdateSubmit}
              onCancel={() => onEditItemChange(null)}
              loading={formLoading}
              submitLabel="Guardar Cambios"
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) onDeleteTargetChange(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              Eliminar producto
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar <span className="font-medium text-foreground">{deleteTarget?.nombre}</span>?
              Esta acción no se puede deshacer y el producto será removido permanentemente del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              disabled={formLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={onBulkDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              Eliminar {selectedCount} producto(s)
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar <span className="font-medium text-foreground">{selectedCount} producto(s)</span> seleccionados?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBulkDeleteConfirm}
              disabled={formLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar ({selectedCount})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
