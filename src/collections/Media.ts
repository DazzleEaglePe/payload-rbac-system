import path from 'path'
import type { CollectionConfig } from 'payload'
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  getPublicIdFromUrl,
  deleteFromCloudinary,
} from '../services/cloudinary.service'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (!isCloudinaryConfigured() || doc.cloudinaryUrl || !doc.filename) return doc

        try {
          const filePath = path.join(process.cwd(), 'media', doc.filename)
          const cloudinaryUrl = await uploadToCloudinary(filePath)

          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: { cloudinaryUrl },
          })
        } catch (err) {
          console.error('☁️ Cloudinary upload failed:', err)
        }

        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        if (!isCloudinaryConfigured() || !doc.cloudinaryUrl) return doc

        try {
          const publicId = getPublicIdFromUrl(doc.cloudinaryUrl)
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }
        } catch (err) {
          console.error('☁️ Cloudinary delete failed:', err)
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'cloudinaryUrl',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'URL auto-generada por Cloudinary (si está configurado)',
      },
    },
  ],
  upload: true,
}
