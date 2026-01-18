import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FavoriteButton } from './FavoriteButton'

// Store original location
const originalLocation = window.location

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  afterEach(() => {
    window.location = originalLocation
  })

  it('should render unfavorited state', () => {
    render(
      <FavoriteButton
        triviaId="trivia-1"
        initialFavorited={false}
        userId="user-1"
      />
    )

    expect(screen.getByText('お気に入り')).toBeInTheDocument()
    expect(screen.getByTitle('お気に入りに追加')).toBeInTheDocument()
  })

  it('should render favorited state', () => {
    render(
      <FavoriteButton
        triviaId="trivia-1"
        initialFavorited={true}
        userId="user-1"
      />
    )

    expect(screen.getByText('お気に入り')).toBeInTheDocument()
    expect(screen.getByTitle('お気に入りを解除')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    render(
      <FavoriteButton
        triviaId="trivia-1"
        initialFavorited={false}
        userId={undefined}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(window.location.href).toBe('/login')
  })

  it('should toggle favorite state on success', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorited: true }),
    } as Response)

    render(
      <FavoriteButton
        triviaId="trivia-1"
        initialFavorited={false}
        userId="user-1"
      />
    )

    const button = screen.getByRole('button')
    expect(screen.getByTitle('お気に入りに追加')).toBeInTheDocument()

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTitle('お気に入りを解除')).toBeInTheDocument()
    })
  })

  it('should call API with correct payload', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorited: true }),
    } as Response)

    render(
      <FavoriteButton
        triviaId="trivia-123"
        initialFavorited={false}
        userId="user-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triviaId: 'trivia-123' }),
      })
    })
  })

  it('should prevent event propagation', async () => {
    const handleClick = vi.fn()
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorited: true }),
    } as Response)

    render(
      <div onClick={handleClick}>
        <FavoriteButton
          triviaId="trivia-1"
          initialFavorited={false}
          userId="user-1"
        />
      </div>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should be disabled while loading', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(global.fetch).mockReturnValueOnce(promise as Promise<Response>)

    render(
      <FavoriteButton
        triviaId="trivia-1"
        initialFavorited={false}
        userId="user-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveClass('opacity-50')
    })

    resolvePromise!({
      ok: true,
      json: async () => ({ favorited: true }),
    })
  })

  it('should handle API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

    render(
      <FavoriteButton
        triviaId="trivia-1"
        initialFavorited={false}
        userId="user-1"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle favorite:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
