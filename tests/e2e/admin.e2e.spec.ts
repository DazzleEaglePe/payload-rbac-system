import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser, testRegularUser } from '../helpers/seedUser'

test.describe('Admin Panel — Admin User', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await page.context().close()
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to users list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const heading = page.locator('h1', { hasText: 'Users' }).first()
    await expect(heading).toBeVisible()
  })

  test('can navigate to user create view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()
  })

  test('can see Permissions collection in the nav (admin visibility)', async () => {
    await page.goto('http://localhost:3000/admin')
    const permissionsLink = page.locator('a[href="/admin/collections/permissions"]').first()
    await expect(permissionsLink).toBeVisible()
  })

  test('can navigate to permissions list', async () => {
    await page.goto('http://localhost:3000/admin/collections/permissions')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/permissions')
  })

  test('can navigate to inventory items list', async () => {
    await page.goto('http://localhost:3000/admin/collections/inventory-items')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/inventory-items')
  })

  test('can access inventory item create form', async () => {
    await page.goto('http://localhost:3000/admin/collections/inventory-items/create')
    await expect(page).toHaveURL(/\/admin\/collections\/inventory-items\/[a-zA-Z0-9-_]+/)
    const nombreInput = page.locator('input[name="nombre"]')
    await expect(nombreInput).toBeVisible()
  })
})

test.describe('Admin Panel — Regular User Restrictions', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('regular user should be redirected away from admin panel', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Login via Payload admin login form
    await page.goto('http://localhost:3000/admin/login')
    await page.fill('#field-email', testRegularUser.email)
    await page.fill('#field-password', testRegularUser.password)
    await page.click('button[type="submit"]')

    // Middleware should redirect non-admin to /unauthorized
    await page.waitForURL(/unauthorized/, { timeout: 15000 })
    await expect(page).toHaveURL(/unauthorized/)

    await context.close()
  })

  test('should NOT be able to access Permissions collection directly', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Login to get cookie
    await page.goto('http://localhost:3000/admin/login')
    await page.fill('#field-email', testRegularUser.email)
    await page.fill('#field-password', testRegularUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/unauthorized/, { timeout: 15000 })

    // Try accessing permissions collection directly
    await page.goto('http://localhost:3000/admin/collections/permissions')
    await page.waitForURL(/unauthorized/, { timeout: 15000 })
    await expect(page).toHaveURL(/unauthorized/)

    await context.close()
  })
})
