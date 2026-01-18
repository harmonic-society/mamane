import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HeeButton } from './HeeButton'

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

describe('HeeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should render with initial count', () => {
    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={false}
        userId="user-1"
        authorId="author-1"
      />
    )

    expect(screen.getByText('ラッシャー！')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', async () => {
    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={false}
        userId={undefined}
        authorId="author-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should be disabled when user has already reacted', () => {
    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={true}
        userId="user-1"
        authorId="author-1"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be disabled for own post', () => {
    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={false}
        userId="author-1"
        authorId="author-1"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-gray-100')
  })

  it('should increment count optimistically on click', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={false}
        userId="user-1"
        authorId="author-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument()
    })
  })

  it('should call API with correct payload', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(
      <HeeButton
        triviaId="trivia-123"
        initialCount={5}
        hasReacted={false}
        userId="user-1"
        authorId="author-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/hee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triviaId: 'trivia-123' }),
      })
    })
  })

  it('should revert count on API error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed' }),
    } as Response)

    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={false}
        userId="user-1"
        authorId="author-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // First it increments optimistically
    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument()
    })

    // Then it reverts on error
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('should display dolphin emoji', () => {
    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={10}
        hasReacted={false}
        userId="user-1"
        authorId="author-1"
      />
    )

    expect(screen.getByText('🐬')).toBeInTheDocument()
  })

  it('should display formatted count for large numbers', () => {
    render(
      <HeeButton
        triviaId="trivia-1"
        initialCount={1000}
        hasReacted={false}
        userId="user-1"
        authorId="author-1"
      />
    )

    expect(screen.getByText('1,000')).toBeInTheDocument()
  })
})
