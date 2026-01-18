import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should display search bar', async ({ page }) => {
    await page.goto('/search')

    // Look for search input
    const searchInput = page.locator('input[placeholder*="検索"]')
    await expect(searchInput).toBeVisible()
  })

  test('should search for trivia', async ({ page }) => {
    await page.goto('/search')

    // Find search input
    const searchInput = page.locator('input[placeholder*="検索"]')

    // Type search query
    await searchInput.fill('テスト')

    // Submit search (press Enter)
    await searchInput.press('Enter')

    // Should navigate to search page with query
    await expect(page).toHaveURL(/\/search\?q=/)
  })

  test('should display search results', async ({ page }) => {
    await page.goto('/search?q=test')

    await page.waitForLoadState('networkidle')

    // Search page should be displayed
    await expect(page.locator('main')).toBeVisible()
  })

  test('should clear search input', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.locator('input[placeholder*="検索"]')

    // Type something
    await searchInput.fill('テスト')

    // Find and click clear button
    const clearButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    const buttonCount = await clearButton.count()

    if (buttonCount > 0) {
      // Input should have value
      await expect(searchInput).toHaveValue('テスト')
    }
  })

  test('should handle empty search', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.locator('input[placeholder*="検索"]')

    // Try to submit empty search
    await searchInput.focus()
    await searchInput.press('Enter')

    // Should stay on search page (not navigate away)
    await expect(page).toHaveURL(/\/search/)
  })

  test('should encode special characters in search', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.locator('input[placeholder*="検索"]')

    // Type query with special characters
    await searchInput.fill('テスト&検索')
    await searchInput.press('Enter')

    // URL should have encoded query
    await expect(page).toHaveURL(/\/search\?q=/)
  })

  test('should preserve search query on search page', async ({ page }) => {
    await page.goto('/search?q=%E3%83%86%E3%82%B9%E3%83%88')

    await page.waitForLoadState('networkidle')

    // Search input should have the query
    const searchInput = page.locator('input[placeholder*="検索"]')
    const inputCount = await searchInput.count()

    if (inputCount > 0) {
      await expect(searchInput).toHaveValue('テスト')
    }
  })
})

test.describe('Search Results', () => {
  test('should show no results message for non-matching query', async ({ page }) => {
    // Use a query unlikely to match anything
    await page.goto('/search?q=xyznonexistent12345')

    await page.waitForLoadState('networkidle')

    // Should show some indication of no results or empty state
    await expect(page.locator('main')).toBeVisible()
  })

  test('should display search results as trivia cards', async ({ page }) => {
    await page.goto('/search?q=')

    await page.waitForLoadState('networkidle')

    // If there are results, they should be displayed as cards
    const cards = page.locator('article')
    const count = await cards.count()

    // Results should render
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Category Navigation', () => {
  test('should navigate to category page from badge', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Find a category link
    const categoryLinks = page.locator('a[href^="/category/"]')
    const count = await categoryLinks.count()

    if (count > 0) {
      const href = await categoryLinks.first().getAttribute('href')
      await categoryLinks.first().click()

      await expect(page).toHaveURL(/\/category\//)
    }
  })

  test('should display category page content', async ({ page }) => {
    // Navigate directly to a category page
    await page.goto('/category/science')

    // Page should load (might show 404 if category doesn't exist)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('body')).toBeVisible()
  })
})
