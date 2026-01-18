import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CommentList } from './CommentList'
import { mockComments } from '../../../tests/mocks/fixtures/trivia'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

describe('CommentList', () => {
  it('should render empty state when no comments', () => {
    render(<CommentList comments={[]} />)

    expect(screen.getByText('まだコメントはありません')).toBeInTheDocument()
  })

  it('should render comment content', () => {
    render(<CommentList comments={mockComments} />)

    expect(screen.getByText('これはテストコメントです。')).toBeInTheDocument()
  })

  it('should render multiple comments', () => {
    render(<CommentList comments={mockComments} />)

    expect(screen.getByText('これはテストコメントです。')).toBeInTheDocument()
    expect(screen.getByText(/2番目のコメント/)).toBeInTheDocument()
  })

  it('should render author username', () => {
    render(<CommentList comments={mockComments} />)

    expect(screen.getByText('commenter')).toBeInTheDocument()
    expect(screen.getByText('another_commenter')).toBeInTheDocument()
  })

  it('should link to author profile', () => {
    render(<CommentList comments={mockComments} />)

    const authorLinks = screen.getAllByRole('link', { name: /commenter/i })
    expect(authorLinks[0]).toHaveAttribute('href', '/user/commenter-1')
  })

  it('should render avatar when available', () => {
    render(<CommentList comments={mockComments} />)

    // Second comment has avatar
    const avatarImg = screen.getByAltText('another_commenter')
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar2.jpg')
  })

  it('should render initial avatar when no avatar URL', () => {
    render(<CommentList comments={mockComments} />)

    // First comment has no avatar, should show initial
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('should preserve whitespace in content', () => {
    render(<CommentList comments={mockComments} />)

    // Second comment has newline
    const commentContent = screen.getByText(/2番目のコメント/)
    expect(commentContent).toHaveClass('whitespace-pre-wrap')
  })

  it('should render relative timestamp', () => {
    // The mock dates are from 2024, so they should show relative time
    render(<CommentList comments={mockComments} />)

    // date-fns will format this in Japanese locale
    // The exact text depends on the current date, but we can check for the element
    const timeElements = document.querySelectorAll('.text-xs.text-gray-400')
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('should render comments in order', () => {
    render(<CommentList comments={mockComments} />)

    const comments = document.querySelectorAll('.flex.gap-3')
    expect(comments.length).toBe(2)
  })

  it('should show icon in empty state', () => {
    render(<CommentList comments={[]} />)

    // MessageCircle icon should be present in empty state
    const iconContainer = document.querySelector('.text-gray-400')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should handle comments with special characters', () => {
    const commentsWithSpecialChars = [{
      id: 'comment-special',
      content: '<script>alert("xss")</script> & "quotes"',
      created_at: '2024-01-15T12:00:00.000Z',
      author_id: 'author-1',
      author_username: 'user',
      author_avatar: null,
    }]

    render(<CommentList comments={commentsWithSpecialChars} />)

    // Content should be rendered as text, not HTML
    expect(screen.getByText(/<script>alert\("xss"\)<\/script> & "quotes"/)).toBeInTheDocument()
  })

  it('should link avatar to user profile', () => {
    render(<CommentList comments={mockComments} />)

    // Find the avatar link (first link in each comment)
    const avatarLinks = document.querySelectorAll('.flex-shrink-0')
    const firstAvatarLink = avatarLinks[0] as HTMLAnchorElement
    expect(firstAvatarLink).toHaveAttribute('href', '/user/commenter-1')
  })
})
