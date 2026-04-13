'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  AlertCircle, Sparkles, Save, Loader2, X, Upload,
} from 'lucide-react'
import gsap from 'gsap'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { inventoryService } from '../services/inventory.service'
import type { CreateInventoryItemDTO, MediaItem } from '@/features/shared/types'

interface ImagePreview {
  id: string
  file?: File
  url: string
  uploading?: boolean
}

interface ProductFormInitial {
  nombre?: string
  sku?: string
  precio?: number
  stock?: number
  descripcion?: string
  imagenes?: MediaItem[] | null
}

interface ProductFormProps {
  initial?: ProductFormInitial
  onSubmit: (data: CreateInventoryItemDTO) => void
  onCancel: () => void
  loading: boolean
  submitLabel: string
  isEdit?: boolean
}

export function ProductForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
  isEdit,
}: ProductFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [precio, setPrecio] = useState(initial?.precio?.toString() ?? '')
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [images, setImages] = useState<ImagePreview[]>(() => {
    if (initial?.imagenes && Array.isArray(initial.imagenes)) {
      return initial.imagenes.map((m) => ({
        id: m.id,
        url: m.cloudinaryUrl || m.url || `/api/media/file/${m.filename}`,
      }))
    }
    return []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (formRef.current) {
      const fields = formRef.current.querySelectorAll('[data-field]')
      gsap.fromTo(
        fields,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' },
      )
    }
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!nombre.trim()) e.nombre = 'Requerido'
    if (!sku.trim()) e.sku = 'Requerido'
    if (!precio || Number(precio) < 0) e.precio = 'Requerido'
    if (!stock || Number(stock) < 0) e.stock = 'Requerido'
    setErrors(e)
    if (Object.keys(e).length > 0 && formRef.current) {
      const errorFields = formRef.current.querySelectorAll('[data-error="true"]')
      gsap.fromTo(errorFields, { x: -3 }, { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.3)' })
    }
    return Object.keys(e).length === 0
  }

  const uploadFile = useCallback(async (file: File) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const preview: ImagePreview = {
      id: tempId,
      file,
      url: URL.createObjectURL(file),
      uploading: true,
    }
    setImages((prev) => [...prev, preview])

    try {
      const media = await inventoryService.uploadMedia(file)
      setImages((prev) =>
        prev.map((img) =>
          img.id === tempId
            ? { id: media.id, url: media.cloudinaryUrl || media.url || `/api/media/file/${media.filename}` }
            : img,
        ),
      )
    } catch (err) {
      setImages((prev) => prev.filter((img) => img.id !== tempId))
      toast.error('Error subiendo imagen', { description: err instanceof Error ? err.message : 'Error desconocido' })
    }
  }, [])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const accepted = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (accepted.length === 0) {
      toast.error('Solo se aceptan archivos de imagen')
      return
    }
    accepted.forEach(uploadFile)
  }, [uploadFile])

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Completa los campos requeridos')
      return
    }
    onSubmit({
      nombre: nombre.trim(),
      sku: sku.trim(),
      precio: Number(precio),
      stock: Number(stock),
      descripcion: descripcion.trim() || undefined,
      imagenes: images.filter((img) => !img.uploading).map((img) => img.id),
    })
  }

  const fieldClass = (key: string, extra?: string) =>
    cn(
      'h-9 text-[13px] bg-transparent transition-colors',
      'border-border/60 focus-visible:border-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0',
      errors[key] && 'border-red-500/60 placeholder:text-red-400/40',
      extra,
    )

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 pt-1">
      <div data-field data-error={!!errors.nombre || undefined} className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="nombre" className="text-[13px] font-medium text-foreground/90">
            Nombre del producto
          </Label>
          {errors.nombre && (
            <span className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.nombre}
            </span>
          )}
        </div>
        <Input
          id="nombre"
          placeholder="Ej: Teclado Mecánico RGB"
          value={nombre}
          onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: '' })) }}
          className={fieldClass('nombre')}
        />
      </div>

      <div data-field data-error={!!errors.sku || undefined} className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="sku" className="text-[13px] font-medium text-foreground/90">
            SKU
          </Label>
          {errors.sku && (
            <span className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.sku}
            </span>
          )}
        </div>
        <Input
          id="sku"
          placeholder="KB-MEC-01"
          value={sku}
          onChange={(e) => { setSku(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, sku: '' })) }}
          className={fieldClass('sku', 'font-mono uppercase tracking-wide')}
        />
      </div>


      <div data-field className="grid grid-cols-2 gap-4">
        <div data-error={!!errors.precio || undefined} className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="precio" className="text-[13px] font-medium text-foreground/90">
              Precio
            </Label>
            {errors.precio && (
              <span className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.precio}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/50 select-none">$</span>
            <Input
              id="precio"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={precio}
              onChange={(e) => { setPrecio(e.target.value); setErrors((p) => ({ ...p, precio: '' })) }}
              className={fieldClass('precio', 'pl-7 tabular-nums')}
            />
          </div>
        </div>

        <div data-error={!!errors.stock || undefined} className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="stock" className="text-[13px] font-medium text-foreground/90">
              Stock
            </Label>
            {errors.stock && (
              <span className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.stock}
              </span>
            )}
          </div>
          <Input
            id="stock"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={stock}
            onChange={(e) => { setStock(e.target.value); setErrors((p) => ({ ...p, stock: '' })) }}
            className={fieldClass('stock', 'tabular-nums')}
          />
        </div>
      </div>

      <Separator className="!my-4 opacity-30" />

      <div data-field className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="descripcion" className="text-[13px] font-medium text-foreground/90">
            Descripción
          </Label>
          <span className="text-[11px] text-muted-foreground/40 tabular-nums">{descripcion.length}/500</span>
        </div>
        <Textarea
          id="descripcion"
          placeholder="Características del producto, materiales, notas..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          maxLength={500}
          className="text-[13px] bg-transparent resize-none border-border/60 focus-visible:border-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div data-field className="space-y-2">
        <Label className="text-[13px] font-medium text-foreground/90">Imágenes</Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex items-center justify-center gap-2 py-4 rounded-md border border-dashed transition-all cursor-pointer',
            isDragging
              ? 'border-foreground/40 bg-muted/40'
              : 'border-border/60 hover:border-foreground/20 hover:bg-muted/20',
          )}
        >
          <Upload className="w-4 h-4 text-muted-foreground/40" />
          <span className="text-[13px] text-muted-foreground/60">
            {isDragging ? 'Soltar archivos' : 'Subir imágenes'}
          </span>
        </div>

        {images.length > 0 && (
          <div className="flex gap-2 pt-1">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <div className={cn(
                  'w-14 h-14 rounded-md overflow-hidden border transition-all',
                  img.uploading ? 'opacity-50' : 'border-border/40',
                )}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
                    </div>
                  )}
                </div>
                {!img.uploading && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="!my-3 opacity-30" />

      <DialogFooter data-field>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="text-muted-foreground hover:text-foreground">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEdit ? (
            <Save className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}
