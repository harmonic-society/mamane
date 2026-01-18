import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with empty input by default', () => {
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    expect(input).toHaveValue('')
  })

  it('should render with initial query', () => {
    render(<SearchBar initialQuery="テスト" />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    expect(input).toHaveValue('テスト')
  })

  it('should update input value on typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    await user.type(input, '検索キーワード')

    expect(input).toHaveValue('検索キーワード')
  })

  it('should navigate to search page on submit', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    await user.type(input, '豆知識')
    await user.keyboard('{Enter}')

    expect(mockPush).toHaveBeenCalledWith('/search?q=%E8%B1%86%E7%9F%A5%E8%AD%98')
  })

  it('should not navigate with empty query', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should not navigate with whitespace only query', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should trim whitespace in query', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    await user.type(input, '  検索  ')
    await user.keyboard('{Enter}')

    expect(mockPush).toHaveBeenCalledWith('/search?q=%E6%A4%9C%E7%B4%A2')
  })

  it('should show clear button when there is text', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')

    // Clear button should not be visible initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    await user.type(input, 'テスト')

    // Clear button should now be visible
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar initialQuery="テスト" />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    expect(input).toHaveValue('テスト')

    const clearButton = screen.getByRole('button')
    await user.click(clearButton)

    expect(input).toHaveValue('')
  })

  it('should hide clear button after clearing', async () => {
    const user = userEvent.setup()
    render(<SearchBar initialQuery="テスト" />)

    const clearButton = screen.getByRole('button')
    await user.click(clearButton)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should encode special characters in URL', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText('豆知識を検索...')
    await user.type(input, 'test&query=123')
    await user.keyboard('{Enter}')

    expect(mockPush).toHaveBeenCalledWith('/search?q=test%26query%3D123')
  })
})
