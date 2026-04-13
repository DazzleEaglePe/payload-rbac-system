import type { CollectionConfig } from 'payload'

export const Permissions: CollectionConfig = {
  slug: 'permissions',
  admin: {
    useAsTitle: 'id',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      required: true,
      unique: true,
    },
    {
      type: 'group',
      name: 'cobranzas',
      fields: [
        { name: 'canRead', type: 'checkbox', defaultValue: false },
        { name: 'canCreate', type: 'checkbox', defaultValue: false },
        { name: 'canUpdate', type: 'checkbox', defaultValue: false },
        { name: 'canDelete', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      type: 'group',
      name: 'ventas',
      fields: [
        { name: 'canRead', type: 'checkbox', defaultValue: false },
        { name: 'canCreate', type: 'checkbox', defaultValue: false },
        { name: 'canUpdate', type: 'checkbox', defaultValue: false },
        { name: 'canDelete', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      type: 'group',
      name: 'inventario',
      fields: [
        { name: 'canRead', type: 'checkbox', defaultValue: false },
        { name: 'canCreate', type: 'checkbox', defaultValue: false },
        { name: 'canUpdate', type: 'checkbox', defaultValue: false },
        { name: 'canDelete', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
