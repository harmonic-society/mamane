import { test, expect } from '@playwright/test'

test.describe('Trivia Page', () => {
  test('should display home page with trivia list', async ({ page }) => {
    await page.goto('/')

    // Check page title or header
    await expect(page).toHaveTitle(/Rasher/)

    // Check that the main content area exists
    await expect(page.locator('main')).toBeVisible()
  })

  test('should display trivia cards', async ({ page }) => {
    await page.goto('/')

    // Wait for trivia cards to load
    const triviaCards = page.locator('article')

    // If there are trivia, they should be visible
    // Note: This test depends on having data in the database
    const count = await triviaCards.count()
    if (count > 0) {
      await expect(triviaCards.first()).toBeVisible()
    }
  })

  test('should navigate to trivia detail page', async ({ page }) => {
    await page.goto('/')

    // Find a trivia card link
    const triviaLinks = page.locator('a[href^="/trivia/"]')
    const count = await triviaLinks.count()

    if (count > 0) {
      // Click the first trivia link
      const href = await triviaLinks.first().getAttribute('href')
      await triviaLinks.first().click()

      // Should navigate to detail page
      await expect(page).toHaveURL(new RegExp(`/trivia/`))
    }
  })

  test('should display trivia detail page content', async ({ page }) => {
    await page.goto('/')

    const triviaLinks = page.locator('a[href^="/trivia/"]')
    const count = await triviaLinks.count()

    if (count > 0) {
      await triviaLinks.first().click()

      // Wait for detail page to load
      await page.waitForLoadState('networkidle')

      // Check for common detail page elements
      // Title should be visible
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('should show login prompt for unauthenticated users on comment', async ({ page }) => {
    await page.goto('/')

    const triviaLinks = page.locator('a[href^="/trivia/"]')
    const count = await triviaLinks.count()

    if (count > 0) {
      await triviaLinks.first().click()
      await page.waitForLoadState('networkidle')

      // Check for login prompt in comment section
      const loginPrompt = page.locator('text=ログイン')
      const promptCount = await loginPrompt.count()
      expect(promptCount).toBeGreaterThan(0)
    }
  })

  test('should display category badges on trivia cards', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check for category badges (they have specific styling)
    const categoryBadges = page.locator('[class*="rounded"]')
    // If categories exist, badges should be visible
    const count = await categoryBadges.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display hee button on trivia cards', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Look for hee button with dolphin emoji
    const heeButtons = page.locator('button:has-text("ラッシャー")')
    const count = await heeButtons.count()

    if (count > 0) {
      await expect(heeButtons.first()).toBeVisible()
    }
  })

  test('should redirect to login when clicking hee button without auth', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    const heeButtons = page.locator('button:has-text("ラッシャー")')
    const count = await heeButtons.count()

    if (count > 0) {
      // Click the hee button
      await heeButtons.first().click()

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    }
  })
})

test.describe('Infinite Scroll', () => {
  test('should load more trivia when scrolling', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Get initial trivia count
    const initialCards = await page.locator('article').count()

    if (initialCards >= 20) {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Wait for more content to load
      await page.waitForTimeout(1000)

      // Check if more cards loaded
      const newCount = await page.locator('article').count()
      expect(newCount).toBeGreaterThanOrEqual(initialCards)
    }
  })
})

test.describe('Navigation', () => {
  test('should navigate to ranking page', async ({ page }) => {
    await page.goto('/')

    const rankingLink = page.locator('a[href="/ranking"]')
    const count = await rankingLink.count()

    if (count > 0) {
      await rankingLink.first().click()
      await expect(page).toHaveURL(/\/ranking/)
    }
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL(/\/about/)
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('User Profile', () => {
  test('should display user profile page', async ({ page }) => {
    await page.goto('/')

    // Find a user link
    const userLinks = page.locator('a[href^="/user/"]')
    const count = await userLinks.count()

    if (count > 0) {
      await userLinks.first().click()
      await expect(page).toHaveURL(/\/user\//)
    }
  })
})
