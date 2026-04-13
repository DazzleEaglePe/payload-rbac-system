import type { InventoryItem, CreateInventoryItemDTO, PaginatedResponse, MediaItem } from '@/features/shared/types'

export type PriceRange = [number, number]

export const inventoryService = {
  getAll: async (
    page = 1,
    limit = 10,
    search?: string,
    sort = '-createdAt',
    priceRange?: PriceRange,
  ): Promise<PaginatedResponse<InventoryItem>> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      depth: '1',
    })
    if (search?.trim()) {
      params.set('where[or][0][nombre][contains]', search.trim())
      params.set('where[or][1][sku][contains]', search.trim())
    }
    if (priceRange) {
      const [min, max] = priceRange
      if (search?.trim()) {
        // wrap search in and[0], price in and[1]
        params.delete('where[or][0][nombre][contains]')
        params.delete('where[or][1][sku][contains]')
        params.set('where[and][0][or][0][nombre][contains]', search.trim())
        params.set('where[and][0][or][1][sku][contains]', search.trim())
        params.set('where[and][1][precio][greater_than_equal]', String(min))
        params.set('where[and][1][precio][less_than_equal]', String(max))
      } else {
        params.set('where[precio][greater_than_equal]', String(min))
        params.set('where[precio][less_than_equal]', String(max))
      }
    }
    const res = await fetch(`/api/inventory-items?${params}`)
    if (!res.ok) {
      if (res.status === 403) throw new Error('No tienes permisos de lectura')
      throw new Error('Error fetching inventory')
    }
    return res.json()
  },

  exportAll: async (search?: string, sort = '-createdAt', priceRange?: PriceRange): Promise<InventoryItem[]> => {
    const data = await inventoryService.getAll(1, 10000, search, sort, priceRange)
    return data.docs
  },

  uploadMedia: async (file: File): Promise<MediaItem> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('_payload', JSON.stringify({ alt: file.name }))

    const res = await fetch('/api/media', { method: 'POST', body: formData })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.errors?.[0]?.message || 'Error subiendo imagen')
    }
    const data = await res.json()
    return data.doc
  },
  
  create: async (data: CreateInventoryItemDTO): Promise<InventoryItem> => {
    const res = await fetch('/api/inventory-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      if (res.status === 403) throw new Error('No tienes permisos para crear')
      const body = await res.json().catch(() => null)
      throw new Error(body?.errors?.[0]?.message || 'Error creando item')
    }
    return res.json()
  },

  update: async (id: string, data: Partial<CreateInventoryItemDTO>): Promise<InventoryItem> => {
    const res = await fetch(`/api/inventory-items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      if (res.status === 403) throw new Error('No tienes permisos para editar')
      const body = await res.json().catch(() => null)
      throw new Error(body?.errors?.[0]?.message || 'Error actualizando item')
    }
    return res.json()
  },
  
  delete: async (id: string): Promise<InventoryItem> => {
    const res = await fetch(`/api/inventory-items/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      if (res.status === 403) throw new Error('No tienes permisos para eliminar')
      throw new Error('Error eliminando item')
    }
    return res.json()
  }
}
