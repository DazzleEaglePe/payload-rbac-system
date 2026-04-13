import { useState, useCallback, useEffect } from 'react'
import { inventoryService } from '../services/inventory.service'
import type { PriceRange } from '../services/inventory.service'
import type { InventoryItem, CreateInventoryItemDTO } from '@/features/shared/types'

export const useInventory = (page: number, limit: number, search?: string, sort = '-createdAt', priceRange?: PriceRange) => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await inventoryService.getAll(page, limit, search, sort, priceRange)
      setItems(data.docs)
      setTotalPages(data.totalPages)
      setTotalDocs(data.totalDocs)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, sort, priceRange?.[0], priceRange?.[1]])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (data: CreateInventoryItemDTO) => {
    await inventoryService.create(data)
    await fetchItems()
  }

  const updateItem = async (id: string, data: Partial<CreateInventoryItemDTO>) => {
    await inventoryService.update(id, data)
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    await inventoryService.delete(id)
    await fetchItems()
  }

  return { items, loading, error, totalPages, totalDocs, createItem, updateItem, deleteItem, refresh: fetchItems }
}
