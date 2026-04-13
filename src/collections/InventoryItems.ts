import type { CollectionConfig } from 'payload'
import { checkModulePermission } from '../services/permissions.service'

export const InventoryItems: CollectionConfig = {
  slug: 'inventory-items',
  admin: {
    useAsTitle: 'nombre',
  },
  access: {
    read: ({ req }) => checkModulePermission(req, 'inventario', 'canRead'),
    create: ({ req }) => checkModulePermission(req, 'inventario', 'canCreate'),
    update: ({ req }) => checkModulePermission(req, 'inventario', 'canUpdate'),
    delete: ({ req }) => checkModulePermission(req, 'inventario', 'canDelete'),
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'precio',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
    },
    {
      name: 'imagenes',
      label: 'Imágenes',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}
