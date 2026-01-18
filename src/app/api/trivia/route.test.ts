import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase server client
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockRange = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

describe('GET /api/trivia', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFrom.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      order: mockOrder,
    })
    mockOrder.mockReturnValue({
      range: mockRange,
    })
  })

  it('should return trivia list for page 0', async () => {
    const mockTriviaData = [
      {
        id: 'trivia-1',
        title: 'Test Trivia',
        content: 'Test content',
        hee_count: 10,
        created_at: '2024-01-15T10:00:00Z',
        user_id: 'user-1',
        category_id: 'cat-1',
        profiles: { id: 'user-1', username: 'testuser', avatar_url: null },
        categories: { id: 'cat-1', name: '科学', slug: 'science', icon: '🔬', color: '#4CAF50' },
        comments: [{ id: 'c1' }, { id: 'c2' }],
      },
    ]
    mockRange.mockResolvedValueOnce({ data: mockTriviaData, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toHaveLength(1)
    expect(data.data[0]).toEqual({
      id: 'trivia-1',
      title: 'Test Trivia',
      content: 'Test content',
      hee_count: 10,
      comment_count: 2,
      created_at: '2024-01-15T10:00:00Z',
      author_id: 'user-1',
      author_username: 'testuser',
      author_avatar: null,
      category_id: 'cat-1',
      category_name: '科学',
      category_slug: 'science',
      category_icon: '🔬',
      category_color: '#4CAF50',
    })
  })

  it('should use correct offset for pagination', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=2')
    await GET(request)

    expect(mockRange).toHaveBeenCalledWith(40, 59)
  })

  it('should default to page 0 when not provided', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    const request = new NextRequest('http://localhost/api/trivia')
    await GET(request)

    expect(mockRange).toHaveBeenCalledWith(0, 19)
  })

  it('should return hasMore true when 20 items returned', async () => {
    const mockTriviaData = Array.from({ length: 20 }, (_, i) => ({
      id: `trivia-${i}`,
      title: `Test ${i}`,
      content: `Content ${i}`,
      hee_count: i,
      created_at: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
      category_id: null,
      profiles: { id: 'user-1', username: 'testuser', avatar_url: null },
      categories: null,
      comments: [],
    }))
    mockRange.mockResolvedValueOnce({ data: mockTriviaData, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    const data = await response.json()
    expect(data.hasMore).toBe(true)
  })

  it('should return hasMore false when less than 20 items', async () => {
    const mockTriviaData = Array.from({ length: 5 }, (_, i) => ({
      id: `trivia-${i}`,
      title: `Test ${i}`,
      content: `Content ${i}`,
      hee_count: i,
      created_at: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
      category_id: null,
      profiles: { id: 'user-1', username: 'testuser', avatar_url: null },
      categories: null,
      comments: [],
    }))
    mockRange.mockResolvedValueOnce({ data: mockTriviaData, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    const data = await response.json()
    expect(data.hasMore).toBe(false)
  })

  it('should handle null categories', async () => {
    const mockTriviaData = [{
      id: 'trivia-1',
      title: 'Test',
      content: 'Content',
      hee_count: 0,
      created_at: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
      category_id: null,
      profiles: { id: 'user-1', username: 'testuser', avatar_url: null },
      categories: null,
      comments: [],
    }]
    mockRange.mockResolvedValueOnce({ data: mockTriviaData, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    const data = await response.json()
    expect(data.data[0].category_id).toBeNull()
    expect(data.data[0].category_name).toBeNull()
    expect(data.data[0].category_slug).toBeNull()
    expect(data.data[0].category_icon).toBeNull()
    expect(data.data[0].category_color).toBeNull()
  })

  it('should return empty array when no trivia', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    const data = await response.json()
    expect(data.data).toEqual([])
    expect(data.hasMore).toBe(false)
  })

  it('should return 500 on database error', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Database error')
  })

  it('should handle null data as empty array', async () => {
    mockRange.mockResolvedValueOnce({ data: null, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toEqual([])
  })

  it('should count comments correctly', async () => {
    const mockTriviaData = [{
      id: 'trivia-1',
      title: 'Test',
      content: 'Content',
      hee_count: 0,
      created_at: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
      category_id: null,
      profiles: { id: 'user-1', username: 'testuser', avatar_url: null },
      categories: null,
      comments: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
    }]
    mockRange.mockResolvedValueOnce({ data: mockTriviaData, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    const data = await response.json()
    expect(data.data[0].comment_count).toBe(3)
  })

  it('should handle undefined comments', async () => {
    const mockTriviaData = [{
      id: 'trivia-1',
      title: 'Test',
      content: 'Content',
      hee_count: 0,
      created_at: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
      category_id: null,
      profiles: { id: 'user-1', username: 'testuser', avatar_url: null },
      categories: null,
      // comments is undefined
    }]
    mockRange.mockResolvedValueOnce({ data: mockTriviaData, error: null })

    const request = new NextRequest('http://localhost/api/trivia?page=0')
    const response = await GET(request)

    const data = await response.json()
    expect(data.data[0].comment_count).toBe(0)
  })
})
