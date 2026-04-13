import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

// ─── Helpers ───────────────────────────────────────────────────────────────
async function createUser(data: { email: string; password: string; nombre: string; role: 'admin' | 'user' }) {
  return payload.create({ collection: 'users', data })
}

async function createPermissions(userId: string, perms: {
  inventario?: { canRead?: boolean; canCreate?: boolean; canUpdate?: boolean; canDelete?: boolean };
  ventas?: { canRead?: boolean; canCreate?: boolean; canUpdate?: boolean; canDelete?: boolean };
  cobranzas?: { canRead?: boolean; canCreate?: boolean; canUpdate?: boolean; canDelete?: boolean };
}) {
  return payload.create({
    collection: 'permissions',
    data: { user: userId, ...perms },
  })
}

async function createInventoryItem(data: { nombre: string; sku: string; precio: number; stock: number }) {
  return payload.create({ collection: 'inventory-items', data })
}

// ─── Setup / Teardown ──────────────────────────────────────────────────────
let adminUser: any
let userWithFullInventory: any
let userWithReadOnly: any
let userWithNoPerms: any
let testItem: any

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })

  // Clean up test data
  await payload.delete({ collection: 'permissions', where: {} })
  await payload.delete({ collection: 'inventory-items', where: {} })
  await payload.delete({ collection: 'users', where: {} })

  // Create users
  adminUser = await createUser({ email: 'admin-test@test.com', password: 'Test1234!', nombre: 'Admin Test', role: 'admin' })
  userWithFullInventory = await createUser({ email: 'full-inv@test.com', password: 'Test1234!', nombre: 'Full Inventory', role: 'user' })
  userWithReadOnly = await createUser({ email: 'readonly@test.com', password: 'Test1234!', nombre: 'Read Only', role: 'user' })
  userWithNoPerms = await createUser({ email: 'noperms@test.com', password: 'Test1234!', nombre: 'No Perms', role: 'user' })

  // Assign permissions
  await createPermissions(userWithFullInventory.id, {
    inventario: { canRead: true, canCreate: true, canUpdate: true, canDelete: true },
    ventas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    cobranzas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
  })
  await createPermissions(userWithReadOnly.id, {
    inventario: { canRead: true, canCreate: false, canUpdate: false, canDelete: false },
    ventas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    cobranzas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
  })
  await createPermissions(userWithNoPerms.id, {
    inventario: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    ventas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    cobranzas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
  })

  // Seed inventory items (using Local API which bypasses access by default)
  testItem = await createInventoryItem({ nombre: 'Test Monitor', sku: 'TST-001', precio: 200, stock: 10 })
  await createInventoryItem({ nombre: 'Test Keyboard', sku: 'TST-002', precio: 50, stock: 30 })
  await createInventoryItem({ nombre: 'Test Mouse', sku: 'TST-003', precio: 25, stock: 100 })
}, 30000)

afterAll(async () => {
  await payload.delete({ collection: 'permissions', where: {} })
  await payload.delete({ collection: 'inventory-items', where: {} })
  await payload.delete({ collection: 'users', where: {} })
})

// ═══════════════════════════════════════════════════════════════════════════
// 1. USERS COLLECTION — Basic CRUD
// ═══════════════════════════════════════════════════════════════════════════
describe('Users Collection', () => {
  it('should create a user with required fields', async () => {
    const user = await createUser({ email: 'extra@test.com', password: 'Pass1234!', nombre: 'Extra User', role: 'user' })
    expect(user).toBeDefined()
    expect(user.email).toBe('extra@test.com')
    expect(user.nombre).toBe('Extra User')
    expect(user.role).toBe('user')
    // Cleanup
    await payload.delete({ collection: 'users', id: user.id })
  })

  it('should have admin and user roles created correctly', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(users.docs.length).toBeGreaterThanOrEqual(4)

    const admin = users.docs.find(u => u.email === 'admin-test@test.com')
    expect(admin?.role).toBe('admin')

    const regularUser = users.docs.find(u => u.email === 'full-inv@test.com')
    expect(regularUser?.role).toBe('user')
  })

  it('should default role to "user" when not specified', async () => {
    const user = await payload.create({
      collection: 'users',
      data: { email: 'default-role@test.com', password: 'Pass1234!', nombre: 'Default Role' } as any,
    })
    expect(user.role).toBe('user')
    await payload.delete({ collection: 'users', id: user.id })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. PERMISSIONS COLLECTION — Structure & Access
// ═══════════════════════════════════════════════════════════════════════════
describe('Permissions Collection', () => {
  it('should have a 1:1 relationship between user and permissions', async () => {
    const perms = await payload.find({
      collection: 'permissions',
      where: { user: { equals: userWithFullInventory.id } },
      depth: 0,
    })
    expect(perms.docs.length).toBe(1)
    expect(perms.docs[0].user).toBe(userWithFullInventory.id)
  })

  it('should store granular CRUD flags per module', async () => {
    const perms = await payload.find({
      collection: 'permissions',
      where: { user: { equals: userWithFullInventory.id } },
    })
    const doc = perms.docs[0]
    expect(doc.inventario).toBeDefined()
    expect(doc.inventario?.canRead).toBe(true)
    expect(doc.inventario?.canCreate).toBe(true)
    expect(doc.inventario?.canUpdate).toBe(true)
    expect(doc.inventario?.canDelete).toBe(true)
  })

  it('should store read-only permissions correctly', async () => {
    const perms = await payload.find({
      collection: 'permissions',
      where: { user: { equals: userWithReadOnly.id } },
    })
    const doc = perms.docs[0]
    expect(doc.inventario?.canRead).toBe(true)
    expect(doc.inventario?.canCreate).toBe(false)
    expect(doc.inventario?.canUpdate).toBe(false)
    expect(doc.inventario?.canDelete).toBe(false)
  })

  it('should allow a regular user to read ONLY their own permissions', async () => {
    const result = await payload.find({
      collection: 'permissions',
      user: userWithFullInventory,
      overrideAccess: false,
      depth: 0,
    })
    // User can only see their own permissions document
    expect(result.docs.length).toBe(1)
    expect(result.docs[0].user).toBe(userWithFullInventory.id)
  })

  it('should NOT allow a regular user to read other users permissions', async () => {
    const result = await payload.find({
      collection: 'permissions',
      user: userWithFullInventory,
      overrideAccess: false,
      where: { user: { equals: userWithReadOnly.id } },
    })
    expect(result.docs.length).toBe(0)
  })

  it('should allow admin to read all permissions', async () => {
    const result = await payload.find({
      collection: 'permissions',
      user: adminUser,
      overrideAccess: false,
    })
    expect(result.docs.length).toBeGreaterThanOrEqual(3)
  })

  it('should deny a regular user from creating permissions', async () => {
    await expect(
      payload.create({
        collection: 'permissions',
        user: userWithFullInventory,
        overrideAccess: false,
        data: {
          user: userWithNoPerms.id,
          inventario: { canRead: true, canCreate: true, canUpdate: true, canDelete: true },
        },
      })
    ).rejects.toThrow()
  })

  it('should deny a regular user from updating permissions', async () => {
    const perms = await payload.find({
      collection: 'permissions',
      where: { user: { equals: userWithReadOnly.id } },
    })
    await expect(
      payload.update({
        collection: 'permissions',
        id: perms.docs[0].id,
        user: userWithReadOnly,
        overrideAccess: false,
        data: { inventario: { canRead: true, canCreate: true, canUpdate: true, canDelete: true } },
      })
    ).rejects.toThrow()
  })

  it('should deny a regular user from deleting permissions', async () => {
    const perms = await payload.find({
      collection: 'permissions',
      where: { user: { equals: userWithReadOnly.id } },
    })
    await expect(
      payload.delete({
        collection: 'permissions',
        id: perms.docs[0].id,
        user: userWithReadOnly,
        overrideAccess: false,
      })
    ).rejects.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. INVENTORY ITEMS — Admin Access (Full CRUD)
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — Admin Access', () => {
  it('admin should be able to READ all inventory items', async () => {
    const result = await payload.find({
      collection: 'inventory-items',
      user: adminUser,
      overrideAccess: false,
    })
    expect(result.docs.length).toBeGreaterThanOrEqual(3)
  })

  it('admin should be able to CREATE an inventory item', async () => {
    const item = await payload.create({
      collection: 'inventory-items',
      user: adminUser,
      overrideAccess: false,
      data: { nombre: 'Admin Created', sku: 'ADM-001', precio: 100, stock: 5 },
    })
    expect(item).toBeDefined()
    expect(item.nombre).toBe('Admin Created')
    // Cleanup
    await payload.delete({ collection: 'inventory-items', id: item.id })
  })

  it('admin should be able to UPDATE an inventory item', async () => {
    const updated = await payload.update({
      collection: 'inventory-items',
      id: testItem.id,
      user: adminUser,
      overrideAccess: false,
      data: { nombre: 'Updated Monitor' },
    })
    expect(updated.nombre).toBe('Updated Monitor')
    // Restore
    await payload.update({
      collection: 'inventory-items',
      id: testItem.id,
      data: { nombre: 'Test Monitor' },
    })
  })

  it('admin should be able to DELETE an inventory item', async () => {
    const temp = await createInventoryItem({ nombre: 'To Delete', sku: 'DEL-001', precio: 1, stock: 1 })
    const deleted = await payload.delete({
      collection: 'inventory-items',
      id: temp.id,
      user: adminUser,
      overrideAccess: false,
    })
    expect(deleted.id).toBe(temp.id)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. INVENTORY ITEMS — User with Full Inventory Permissions
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — User with Full Permissions', () => {
  it('should READ inventory items', async () => {
    const result = await payload.find({
      collection: 'inventory-items',
      user: userWithFullInventory,
      overrideAccess: false,
    })
    expect(result.docs.length).toBeGreaterThanOrEqual(1)
  })

  it('should CREATE an inventory item', async () => {
    const item = await payload.create({
      collection: 'inventory-items',
      user: userWithFullInventory,
      overrideAccess: false,
      data: { nombre: 'User Created', sku: 'USR-001', precio: 75, stock: 20 },
    })
    expect(item).toBeDefined()
    expect(item.nombre).toBe('User Created')
    await payload.delete({ collection: 'inventory-items', id: item.id })
  })

  it('should UPDATE an inventory item', async () => {
    const updated = await payload.update({
      collection: 'inventory-items',
      id: testItem.id,
      user: userWithFullInventory,
      overrideAccess: false,
      data: { stock: 999 },
    })
    expect(updated.stock).toBe(999)
    await payload.update({ collection: 'inventory-items', id: testItem.id, data: { stock: 10 } })
  })

  it('should DELETE an inventory item', async () => {
    const temp = await createInventoryItem({ nombre: 'User Delete', sku: 'UDEL-001', precio: 1, stock: 1 })
    const deleted = await payload.delete({
      collection: 'inventory-items',
      id: temp.id,
      user: userWithFullInventory,
      overrideAccess: false,
    })
    expect(deleted.id).toBe(temp.id)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. INVENTORY ITEMS — User with Read-Only Permission
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — User with Read-Only Permission', () => {
  it('should READ inventory items', async () => {
    const result = await payload.find({
      collection: 'inventory-items',
      user: userWithReadOnly,
      overrideAccess: false,
    })
    expect(result.docs.length).toBeGreaterThanOrEqual(1)
  })

  it('should be DENIED creating an inventory item', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        user: userWithReadOnly,
        overrideAccess: false,
        data: { nombre: 'Blocked', sku: 'BLK-001', precio: 10, stock: 1 },
      })
    ).rejects.toThrow()
  })

  it('should be DENIED updating an inventory item', async () => {
    await expect(
      payload.update({
        collection: 'inventory-items',
        id: testItem.id,
        user: userWithReadOnly,
        overrideAccess: false,
        data: { nombre: 'Hacked Name' },
      })
    ).rejects.toThrow()
  })

  it('should be DENIED deleting an inventory item', async () => {
    await expect(
      payload.delete({
        collection: 'inventory-items',
        id: testItem.id,
        user: userWithReadOnly,
        overrideAccess: false,
      })
    ).rejects.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. INVENTORY ITEMS — User with No Permissions
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — User with No Permissions', () => {
  it('should be DENIED reading inventory items', async () => {
    await expect(
      payload.find({
        collection: 'inventory-items',
        user: userWithNoPerms,
        overrideAccess: false,
      })
    ).rejects.toThrow()
  })

  it('should be DENIED creating an inventory item', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        user: userWithNoPerms,
        overrideAccess: false,
        data: { nombre: 'Blocked', sku: 'NOPE-001', precio: 10, stock: 1 },
      })
    ).rejects.toThrow()
  })

  it('should be DENIED updating an inventory item', async () => {
    await expect(
      payload.update({
        collection: 'inventory-items',
        id: testItem.id,
        user: userWithNoPerms,
        overrideAccess: false,
        data: { nombre: 'Hacked' },
      })
    ).rejects.toThrow()
  })

  it('should be DENIED deleting an inventory item', async () => {
    await expect(
      payload.delete({
        collection: 'inventory-items',
        id: testItem.id,
        user: userWithNoPerms,
        overrideAccess: false,
      })
    ).rejects.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 7. INVENTORY ITEMS — Unauthenticated Access
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — Unauthenticated Access', () => {
  it('should be DENIED reading without authentication', async () => {
    await expect(
      payload.find({
        collection: 'inventory-items',
        user: undefined as any,
        overrideAccess: false,
      })
    ).rejects.toThrow()
  })

  it('should be DENIED creating without authentication', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        user: undefined as any,
        overrideAccess: false,
        data: { nombre: 'Anon', sku: 'ANON-001', precio: 1, stock: 1 },
      })
    ).rejects.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 8. INVENTORY ITEMS — Pagination
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — Pagination', () => {
  it('should respect limit parameter', async () => {
    const result = await payload.find({
      collection: 'inventory-items',
      limit: 2,
    })
    expect(result.docs.length).toBeLessThanOrEqual(2)
    expect(result.totalDocs).toBeGreaterThanOrEqual(3)
    expect(result.totalPages).toBeGreaterThanOrEqual(2)
  })

  it('should return correct page info', async () => {
    const page1 = await payload.find({ collection: 'inventory-items', limit: 2, page: 1 })
    const page2 = await payload.find({ collection: 'inventory-items', limit: 2, page: 2 })

    expect(page1.page).toBe(1)
    expect(page2.page).toBe(2)
    expect(page1.hasNextPage).toBe(true)
    // Items on page 2 should be different than page 1
    if (page2.docs.length > 0) {
      expect(page2.docs[0].id).not.toBe(page1.docs[0].id)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 9. INVENTORY ITEMS — Data Validation
// ═══════════════════════════════════════════════════════════════════════════
describe('Inventory Items — Data Validation', () => {
  it('should require nombre field', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        data: { sku: 'VAL-001', precio: 10, stock: 1 } as any,
      })
    ).rejects.toThrow()
  })

  it('should require sku field', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        data: { nombre: 'No SKU', precio: 10, stock: 1 } as any,
      })
    ).rejects.toThrow()
  })

  it('should enforce unique SKU', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        data: { nombre: 'Duplicate', sku: 'TST-001', precio: 10, stock: 1 },
      })
    ).rejects.toThrow()
  })

  it('should require precio field', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        data: { nombre: 'No Price', sku: 'VAL-002', stock: 1 } as any,
      })
    ).rejects.toThrow()
  })

  it('should require stock field', async () => {
    await expect(
      payload.create({
        collection: 'inventory-items',
        data: { nombre: 'No Stock', sku: 'VAL-003', precio: 10 } as any,
      })
    ).rejects.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 10. PERMISSIONS — Deny by Default (Edge Cases)
// ═══════════════════════════════════════════════════════════════════════════
describe('RBAC — Deny by Default', () => {
  it('user without a permissions document should be denied all access to inventory', async () => {
    const orphanUser = await createUser({ email: 'orphan@test.com', password: 'Test1234!', nombre: 'Orphan', role: 'user' })
    // No permissions doc created for this user

    await expect(
      payload.find({
        collection: 'inventory-items',
        user: orphanUser,
        overrideAccess: false,
      })
    ).rejects.toThrow()

    await expect(
      payload.create({
        collection: 'inventory-items',
        user: orphanUser,
        overrideAccess: false,
        data: { nombre: 'Orphan Item', sku: 'ORP-001', precio: 1, stock: 1 },
      })
    ).rejects.toThrow()

    await payload.delete({ collection: 'users', id: orphanUser.id })
  })

  it('admin should always have full access regardless of permissions document', async () => {
    // Admin has no permissions document — should still have full access
    const result = await payload.find({
      collection: 'inventory-items',
      user: adminUser,
      overrideAccess: false,
    })
    expect(result.docs.length).toBeGreaterThanOrEqual(1)

    const item = await payload.create({
      collection: 'inventory-items',
      user: adminUser,
      overrideAccess: false,
      data: { nombre: 'Admin Always', sku: 'ADM-ALWAYS', precio: 1, stock: 1 },
    })
    expect(item).toBeDefined()
    await payload.delete({ collection: 'inventory-items', id: item.id })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 11. PERMISSIONS COLLECTION — Unique User Constraint
// ═══════════════════════════════════════════════════════════════════════════
describe('Permissions — Unique User Constraint', () => {
  it('should not allow duplicate permissions for the same user', async () => {
    await expect(
      payload.create({
        collection: 'permissions',
        data: {
          user: userWithFullInventory.id,
          inventario: { canRead: true, canCreate: false, canUpdate: false, canDelete: false },
        },
      })
    ).rejects.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 12. ROLE FIELD — Only Admin Can Update Roles
// ═══════════════════════════════════════════════════════════════════════════
describe('Users — Role Field Access', () => {
  it('admin should be able to change a user role', async () => {
    const tempUser = await createUser({ email: 'role-test@test.com', password: 'Test1234!', nombre: 'Role Test', role: 'user' })
    const updated = await payload.update({
      collection: 'users',
      id: tempUser.id,
      user: adminUser,
      overrideAccess: false,
      data: { role: 'admin' },
    })
    expect(updated.role).toBe('admin')
    await payload.delete({ collection: 'users', id: tempUser.id })
  })

  it('regular user should NOT be able to escalate their own role', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: userWithFullInventory.id,
      user: userWithFullInventory,
      overrideAccess: false,
      data: { role: 'admin' },
    })
    // The role field has field-level access: only admin can update it.
    // For a non-admin user, the field should remain unchanged.
    expect(updated.role).toBe('user')
  })
})
