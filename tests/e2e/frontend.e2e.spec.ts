import { test, expect, Page } from '@playwright/test'
import { seedTestUser, cleanupTestUser, seedInventoryItems, testUser, testRegularUser } from '../helpers/seedUser'

const BASE = 'http://localhost:3000'

// ─── Helper: login via the frontend form ────────────────────────────────
async function frontendLogin(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  // Wait for redirect to dashboard
  await page.waitForURL(BASE + '/', { timeout: 15000 })
}

/** Hover the sidebar to expand it (default mode is 'hover' → collapsed) */
async function expandSidebar(page: Page) {
  const sidebar = page.locator('aside').first()
  await sidebar.hover()
  await page.waitForTimeout(400)
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. LOGIN FLOW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Login', () => {
  test.beforeAll(async () => {
    await seedTestUser()
    await seedInventoryItems()
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('should show login page', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    const heading = page.locator('h1', { hasText: 'Login to your account' })
    await expect(heading).toBeVisible()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', 'wrong@wrong.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    const errorMessage = page.locator('text=Error').or(page.locator('text=inválid'))
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 })
  })

  test('should login successfully as admin and redirect to dashboard', async ({ page }) => {
    await frontendLogin(page, testUser.email, testUser.password)
    await expect(page).toHaveURL(BASE + '/')
    // Should see the user's name in the sidebar or dashboard
    const greeting = page.locator('text=Hola')
    await expect(greeting.first()).toBeVisible({ timeout: 30000 })
  })

  test('should login successfully as regular user', async ({ page }) => {
    await frontendLogin(page, testRegularUser.email, testRegularUser.password)
    await expect(page).toHaveURL(BASE + '/')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. PROTECTED ROUTES — Unauthenticated
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Protected Routes (Unauthenticated)', () => {
  test('should redirect to /login when accessing / without session', async ({ page }) => {
    await page.goto(BASE + '/')
    // ProtectedRoute should redirect to login (client-side, needs hydration)
    await page.waitForURL(/\/login/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to /login when accessing /inventario without session', async ({ page }) => {
    await page.goto(BASE + '/inventario')
    await page.waitForURL(/\/login/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to /login when accessing /ventas without session', async ({ page }) => {
    await page.goto(BASE + '/ventas')
    await page.waitForURL(/\/login/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to /login when accessing /cobranzas without session', async ({ page }) => {
    await page.goto(BASE + '/cobranzas')
    await page.waitForURL(/\/login/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. SIDEBAR — Dynamic Navigation (Admin)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Sidebar (Admin)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    await seedInventoryItems()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testUser.email, testUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('admin should see all navigation items', async () => {
    await page.goto(BASE + '/')
    await expandSidebar(page)
    // Dashboard, Inventario, Ventas, Cobranzas should all be visible
    await expect(page.locator('a', { hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 })
    await expect(page.locator('a', { hasText: 'Inventario' }).first()).toBeVisible()
    await expect(page.locator('a', { hasText: 'Ventas' }).first()).toBeVisible()
    await expect(page.locator('a', { hasText: 'Cobranzas' }).first()).toBeVisible()
  })

  test('admin should see their email in sidebar', async () => {
    await page.goto(BASE + '/')
    await expandSidebar(page)
    // The user section shows the email which contains 'admin'
    const adminText = page.locator('text=dev@payloadcms.com')
    await expect(adminText.first()).toBeVisible({ timeout: 10000 })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. SIDEBAR — Dynamic Navigation (Regular User)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Sidebar (Regular User with Inventory Read)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    await seedInventoryItems()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testRegularUser.email, testRegularUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('regular user should see Dashboard link', async () => {
    await page.goto(BASE + '/')
    await expandSidebar(page)
    await expect(page.locator('a', { hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 })
  })

  test('regular user with inventario.canRead should see Inventario link', async () => {
    await page.goto(BASE + '/')
    await expandSidebar(page)
    // User has canRead=true for inventario
    await expect(page.locator('a', { hasText: 'Inventario' }).first()).toBeVisible({ timeout: 15000 })
  })

  test('regular user without ventas permission should NOT see Ventas link', async () => {
    await page.goto(BASE + '/')
    // Give extra time for permissions to load
    await page.waitForTimeout(3000)
    const ventasLink = page.locator('a', { hasText: 'Ventas' })
    await expect(ventasLink).toHaveCount(0)
  })

  test('regular user without cobranzas permission should NOT see Cobranzas link', async () => {
    await page.goto(BASE + '/')
    await page.waitForTimeout(3000)
    const cobranzasLink = page.locator('a', { hasText: 'Cobranzas' })
    await expect(cobranzasLink).toHaveCount(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. INVENTORY MODULE — Admin Full Access
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Inventario Page (Admin)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    await seedInventoryItems()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testUser.email, testUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('admin should see inventory list', async () => {
    await page.goto(BASE + '/inventario')
    await expect(page.locator('h1', { hasText: 'Inventario' }).first()).toBeVisible({ timeout: 15000 })
    // Should see product names in the table
    await expect(page.locator('text=E2E Monitor').first()).toBeVisible({ timeout: 10000 })
  })

  test('admin should see "Nuevo Producto" button (canCreate)', async () => {
    await page.goto(BASE + '/inventario')
    const createBtn = page.locator('button', { hasText: 'Nuevo Producto' })
    await expect(createBtn.first()).toBeVisible({ timeout: 10000 })
  })

  test('admin should see delete option in row actions (canDelete)', async () => {
    await page.goto(BASE + '/inventario')
    await page.waitForSelector('table', { timeout: 10000 })
    // Actions are in a dropdown menu — open it on the first row
    const actionBtn = page.locator('button:has(span.sr-only)').first()
    await actionBtn.click({ force: true })
    const deleteMenuItem = page.locator('[role="menuitem"]', { hasText: 'Eliminar' })
    await expect(deleteMenuItem).toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. INVENTORY MODULE — Regular User (Read + Create, No Update/Delete)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Inventario Page (Regular User)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    await seedInventoryItems()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testRegularUser.email, testRegularUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('regular user with canRead should see inventory list', async () => {
    await page.goto(BASE + '/inventario')
    await expect(page.locator('h1', { hasText: 'Inventario' }).first()).toBeVisible({ timeout: 15000 })
  })

  test('regular user with canCreate should see "Nuevo Producto" button', async () => {
    await page.goto(BASE + '/inventario')
    const createBtn = page.locator('button', { hasText: 'Nuevo Producto' })
    await expect(createBtn.first()).toBeVisible({ timeout: 10000 })
  })

  test('regular user without canDelete should NOT see action menu', async () => {
    await page.goto(BASE + '/inventario')
    await page.waitForSelector('table', { timeout: 10000 })
    // User has canUpdate=false AND canDelete=false, so no action dropdown renders
    const actionBtns = page.locator('button:has(span:has-text("Acciones"))')
    await expect(actionBtns).toHaveCount(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 7. UNAUTHORIZED PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Unauthorized Page', () => {
  test('should display access denied message', async ({ page }) => {
    await page.goto(BASE + '/unauthorized')
    const heading = page.locator('h2', { hasText: 'Acceso Denegado' })
    await expect(heading.first()).toBeVisible({ timeout: 15000 })
  })

  test('should have a link back to dashboard', async ({ page }) => {
    await page.goto(BASE + '/unauthorized')
    const backLink = page.locator('a', { hasText: 'Ir al Dashboard' })
    await expect(backLink.first()).toBeVisible({ timeout: 15000 })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 8. VENTAS & COBRANZAS MODULES
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Ventas Page (Admin)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testUser.email, testUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('admin should see ventas page', async () => {
    await page.goto(BASE + '/ventas')
    await expect(page.locator('h1', { hasText: 'Ventas' }).first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Frontend — Cobranzas Page (Admin)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testUser.email, testUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('admin should see cobranzas page', async () => {
    await page.goto(BASE + '/cobranzas')
    await expect(page.locator('h1', { hasText: 'Cobranzas' }).first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Frontend — Ventas/Cobranzas (Regular User without permission)', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
    page = await context.newPage()
    await frontendLogin(page, testRegularUser.email, testRegularUser.password)
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('regular user without ventas permission should be redirected to unauthorized', async () => {
    await page.goto(BASE + '/ventas')
    await page.waitForURL(/\/unauthorized/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/unauthorized/)
  })

  test('regular user without cobranzas permission should be redirected to unauthorized', async () => {
    await page.goto(BASE + '/cobranzas')
    await page.waitForURL(/\/unauthorized/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/unauthorized/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 9. LOGOUT FLOW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Frontend — Logout', () => {
  test('should logout and redirect to login', async ({ page }) => {
    await seedTestUser()
    await frontendLogin(page, testUser.email, testUser.password)
    
    // Expand sidebar and open user dropdown
    await expandSidebar(page)
    // Click the user area to open dropdown menu
    const userTrigger = page.locator('aside button:has(span:has-text("Dev Test Admin"))').first()
    await expect(userTrigger).toBeVisible({ timeout: 15000 })
    await userTrigger.click()
    
    // Click logout in the dropdown
    const logoutBtn = page.locator('[role="menuitem"]', { hasText: 'Cerrar sesión' })
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/login/)
    
    await cleanupTestUser()
  })
})
