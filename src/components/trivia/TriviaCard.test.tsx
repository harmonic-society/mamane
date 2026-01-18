import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TriviaCard } from './TriviaCard'
import { mockTrivia, mockTriviaList } from '../../../tests/mocks/fixtures/trivia'

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

describe('TriviaCard', () => {
  it('should render trivia title', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    expect(screen.getByText('テストトリビア')).toBeInTheDocument()
  })

  it('should render trivia content', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    expect(screen.getByText('これはテスト用のトリビアです。')).toBeInTheDocument()
  })

  it('should render author username', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('should render comment count', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render category badge when category exists', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    expect(screen.getByText('科学')).toBeInTheDocument()
    expect(screen.getByText('🔬')).toBeInTheDocument()
  })

  it('should not render category badge when category is null', () => {
    const triviaWithoutCategory = mockTriviaList[2] // Has null category
    render(
      <TriviaCard
        trivia={triviaWithoutCategory}
        hasReacted={false}
        userId="user-1"
      />
    )

    expect(screen.queryByText('科学')).not.toBeInTheDocument()
  })

  it('should render rank badge when provided', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
        rank={1}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should apply gold color for rank 1', () => {
    const { container } = render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
        rank={1}
      />
    )

    const rankBadge = container.querySelector('.bg-yellow-400')
    expect(rankBadge).toBeInTheDocument()
  })

  it('should apply silver color for rank 2', () => {
    const { container } = render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
        rank={2}
      />
    )

    const rankBadge = container.querySelector('.bg-gray-400')
    expect(rankBadge).toBeInTheDocument()
  })

  it('should apply bronze color for rank 3', () => {
    const { container } = render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
        rank={3}
      />
    )

    const rankBadge = container.querySelector('.bg-amber-600')
    expect(rankBadge).toBeInTheDocument()
  })

  it('should not render rank badge when not provided', () => {
    const { container } = render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    // Check there's no rank badge by looking for absolute positioned element with specific classes
    const rankBadge = container.querySelector('.-top-3.-left-3')
    expect(rankBadge).not.toBeInTheDocument()
  })

  it('should render author avatar when available', () => {
    const triviaWithAvatar = mockTriviaList[1] // Has avatar
    render(
      <TriviaCard
        trivia={triviaWithAvatar}
        hasReacted={false}
        userId="user-1"
      />
    )

    const avatarImg = screen.getByRole('img')
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should render initial avatar when no avatar URL', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    // Should show first letter of username
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('should link to trivia detail page', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    const titleLink = screen.getByRole('link', { name: 'テストトリビア' })
    expect(titleLink).toHaveAttribute('href', '/trivia/trivia-1')
  })

  it('should link to author profile', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={false}
        userId="user-1"
      />
    )

    const authorLink = screen.getByRole('link', { name: /testuser/i })
    expect(authorLink).toHaveAttribute('href', '/user/author-1')
  })

  it('should pass hasReacted to HeeButton', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        hasReacted={true}
        userId="user-1"
      />
    )

    const heeButton = screen.getByRole('button')
    expect(heeButton).toBeDisabled()
  })
})
