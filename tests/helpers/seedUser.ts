import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  nombre: 'Dev Test Admin',
  role: 'admin' as const,
}

export const testRegularUser = {
  email: 'regular@payloadcms.com',
  password: 'test',
  nombre: 'Regular Test User',
  role: 'user' as const,
}

/**
 * Seeds test users for e2e tests: one admin and one regular user with inventory permissions.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Clean up existing test users
  await payload.delete({
    collection: 'users',
    where: {
      or: [
        { email: { equals: testUser.email } },
        { email: { equals: testRegularUser.email } },
      ],
    },
  })

  // Create admin user
  await payload.create({
    collection: 'users',
    data: testUser,
  })

  // Create regular user
  const regularUser = await payload.create({
    collection: 'users',
    data: testRegularUser,
  })

  // Clean and create permissions for the regular user
  await payload.delete({
    collection: 'permissions',
    where: { user: { equals: regularUser.id } },
  })

  await payload.create({
    collection: 'permissions',
    data: {
      user: regularUser.id,
      inventario: { canRead: true, canCreate: true, canUpdate: false, canDelete: false },
      ventas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
      cobranzas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    },
  })
}

/**
 * Seeds inventory items for e2e tests.
 */
export async function seedInventoryItems(): Promise<void> {
  const payload = await getPayload({ config })

  // Clean existing test items
  await payload.delete({
    collection: 'inventory-items',
    where: { sku: { like: 'E2E-' } },
  })

  await payload.create({
    collection: 'inventory-items',
    data: { nombre: 'E2E Monitor', sku: 'E2E-001', precio: 300, stock: 15, descripcion: 'Item para pruebas E2E' },
  })
  await payload.create({
    collection: 'inventory-items',
    data: { nombre: 'E2E Teclado', sku: 'E2E-002', precio: 80, stock: 50, descripcion: 'Item para pruebas E2E' },
  })
}

/**
 * Cleans up all test data after tests.
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Clean permissions first (FK dependency)
  const regularUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: testRegularUser.email } },
  })
  for (const user of regularUsers.docs) {
    await payload.delete({
      collection: 'permissions',
      where: { user: { equals: user.id } },
    })
  }

  await payload.delete({
    collection: 'inventory-items',
    where: { sku: { like: 'E2E-' } },
  })

  await payload.delete({
    collection: 'users',
    where: {
      or: [
        { email: { equals: testUser.email } },
        { email: { equals: testRegularUser.email } },
      ],
    },
  })
}
