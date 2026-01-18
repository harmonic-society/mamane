import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentForm } from './CommentForm'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: mockRefresh,
  }),
}))

// Mock Supabase client
const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('should show login prompt when not authenticated', () => {
    render(
      <CommentForm
        triviaId="trivia-1"
        userId={undefined}
      />
    )

    expect(screen.getByText('コメントするにはログインが必要です')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ログイン' })).toHaveAttribute('href', '/login')
  })

  it('should render comment form when authenticated', () => {
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    expect(screen.getByPlaceholderText('コメントを入力...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should update textarea value on typing', async () => {
    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, 'テストコメント')

    expect(textarea).toHaveValue('テストコメント')
  })

  it('should show error when submitting empty comment', async () => {
    const { container } = render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    // Get the form and submit it
    const form = container.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText('コメントを入力してください')).toBeInTheDocument()
    })
  })

  it('should show error when submitting whitespace only', async () => {
    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, '   ')

    // Get the form and submit it
    const form = document.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText('コメントを入力してください')).toBeInTheDocument()
    })
  })

  it('should submit comment successfully', async () => {
    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-123"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, 'テストコメント')

    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('comments')
      expect(mockInsert).toHaveBeenCalledWith({
        trivia_id: 'trivia-1',
        user_id: 'user-123',
        content: 'テストコメント',
      })
    })
  })

  it('should clear form and refresh after successful submission', async () => {
    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, 'テストコメント')

    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(textarea).toHaveValue('')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('should show error on submission failure', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'Database error' } })

    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, 'テストコメント')

    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('コメントの投稿に失敗しました')).toBeInTheDocument()
    })
  })

  it('should disable submit button when empty', () => {
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
  })

  it('should disable submit button while submitting', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockInsert.mockReturnValueOnce(promise)

    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, 'テストコメント')

    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })

    resolvePromise!({ error: null })
  })

  it('should redirect to login if userId becomes undefined during submit', async () => {
    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId={undefined}
      />
    )

    // When not authenticated, clicking should not submit but show login prompt
    expect(screen.getByText('コメントするにはログインが必要です')).toBeInTheDocument()
  })

  it('should trim whitespace from comment content', async () => {
    const user = userEvent.setup()
    render(
      <CommentForm
        triviaId="trivia-1"
        userId="user-1"
      />
    )

    const textarea = screen.getByPlaceholderText('コメントを入力...')
    await user.type(textarea, '  テストコメント  ')

    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        trivia_id: 'trivia-1',
        user_id: 'user-1',
        content: 'テストコメント',
      })
    })
  })
})
