import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TriviaList } from './TriviaList'
import { mockTriviaList, generateTriviaList } from '../../../tests/mocks/fixtures/trivia'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock IntersectionObserver
let intersectionCallback: IntersectionObserverCallback | null = null
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()

  // Reset IntersectionObserver mock
  intersectionCallback = null
  window.IntersectionObserver = vi.fn((callback) => {
    intersectionCallback = callback
    return {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    }
  }) as any
})

describe('TriviaList', () => {
  it('should render empty state when no trivia', () => {
    render(
      <TriviaList
        initialTriviaList={[]}
        userReactions={[]}
        userId="user-1"
      />
    )

    expect(screen.getByText('まだ豆知識がありません')).toBeInTheDocument()
  })

  it('should render initial trivia list', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList}
        userReactions={[]}
        userId="user-1"
      />
    )

    expect(screen.getByText('テストトリビア')).toBeInTheDocument()
    expect(screen.getByText('2番目のトリビア')).toBeInTheDocument()
    expect(screen.getByText('3番目のトリビア')).toBeInTheDocument()
  })

  it('should mark reacted trivia correctly', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList}
        userReactions={['trivia-1']}
        userId="user-1"
      />
    )

    // The first trivia's HeeButton should be disabled
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('should show rank when showRank is true', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList}
        userReactions={[]}
        userId="user-1"
        showRank={true}
      />
    )

    // Rank badges should be visible
    const container = document.querySelector('.bg-yellow-400')
    expect(container).toBeInTheDocument()
  })

  it('should not show rank when showRank is false', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList}
        userReactions={[]}
        userId="user-1"
        showRank={false}
      />
    )

    // No rank badges
    const container = document.querySelector('.bg-yellow-400')
    expect(container).not.toBeInTheDocument()
  })

  it('should set hasMore to false when initial list has fewer than 20 items', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList} // 3 items
        userReactions={[]}
        userId="user-1"
      />
    )

    // Should show "すべての豆知識を表示しました" since hasMore is false
    expect(screen.getByText('すべての豆知識を表示しました')).toBeInTheDocument()
  })

  it('should set hasMore to true when initial list has exactly 20 items', () => {
    const fullList = generateTriviaList(20)
    render(
      <TriviaList
        initialTriviaList={fullList}
        userReactions={[]}
        userId="user-1"
      />
    )

    // Should not show completion message when hasMore is true
    expect(screen.queryByText('すべての豆知識を表示しました')).not.toBeInTheDocument()
  })

  it('should load more trivia when scrolling to bottom', async () => {
    const initialList = generateTriviaList(20)
    const additionalList = generateTriviaList(5, 20)

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: additionalList, hasMore: false }),
    } as Response)

    render(
      <TriviaList
        initialTriviaList={initialList}
        userReactions={[]}
        userId="user-1"
      />
    )

    // Simulate intersection observer triggering
    intersectionCallback!([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/trivia?page=1')
    })

    await waitFor(() => {
      expect(screen.getByText('トリビア 21')).toBeInTheDocument()
    })
  })

  it('should show loading spinner while fetching', async () => {
    const initialList = generateTriviaList(20)

    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(global.fetch).mockReturnValueOnce(promise as Promise<Response>)

    render(
      <TriviaList
        initialTriviaList={initialList}
        userReactions={[]}
        userId="user-1"
      />
    )

    // Trigger load more
    intersectionCallback!([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)

    await waitFor(() => {
      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })

    resolvePromise!({
      ok: true,
      json: async () => ({ data: [], hasMore: false }),
    })
  })

  it('should not load more when already loading', async () => {
    const initialList = generateTriviaList(20)

    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(global.fetch).mockReturnValue(promise as Promise<Response>)

    render(
      <TriviaList
        initialTriviaList={initialList}
        userReactions={[]}
        userId="user-1"
      />
    )

    // Trigger load more
    intersectionCallback!([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)

    // Wait for isLoading to be set to true
    await waitFor(() => {
      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })

    // Trigger again while loading
    intersectionCallback!([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)

    // Should only be called once since isLoading prevents duplicate calls
    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolvePromise!({
      ok: true,
      json: async () => ({ data: [], hasMore: false }),
    })
  })

  it('should not load more when hasMore is false', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList} // 3 items, so hasMore = false
        userReactions={[]}
        userId="user-1"
      />
    )

    // Trigger intersection
    intersectionCallback!([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const initialList = generateTriviaList(20)

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

    render(
      <TriviaList
        initialTriviaList={initialList}
        userReactions={[]}
        userId="user-1"
      />
    )

    intersectionCallback!([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load more trivia:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should observe loader element', () => {
    render(
      <TriviaList
        initialTriviaList={mockTriviaList}
        userReactions={[]}
        userId="user-1"
      />
    )

    expect(mockObserve).toHaveBeenCalled()
  })

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(
      <TriviaList
        initialTriviaList={mockTriviaList}
        userReactions={[]}
        userId="user-1"
      />
    )

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })
})
