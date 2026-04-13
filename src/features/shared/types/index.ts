import type { Module, Operation } from '@/services/permissions.service'

export interface AppUser {
  id: string
  email: string
  nombre: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface ModulePermissions {
  canRead?: boolean | null
  canCreate?: boolean | null
  canUpdate?: boolean | null
  canDelete?: boolean | null
}

export interface UserPermissions {
  id: string
  user: string | AppUser
  cobranzas?: ModulePermissions
  ventas?: ModulePermissions
  inventario?: ModulePermissions
  createdAt: string
  updatedAt: string
}

export interface MediaItem {
  id: string
  alt: string
  filename: string
  url: string
  cloudinaryUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  nombre: string
  sku: string
  precio: number
  stock: number
  descripcion?: string | null
  imagenes?: MediaItem[] | null
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryItemDTO {
  nombre: string
  sku: string
  precio: number
  stock: number
  descripcion?: string
  imagenes?: string[]
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface LoginResponse {
  user: AppUser
  token: string
  exp: number
}

export type { Module, Operation }
