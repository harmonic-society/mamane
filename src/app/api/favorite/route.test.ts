import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockDelete = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

// Mock fetch for notifications
global.fetch = vi.fn()

describe('POST /api/favorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
    })
    mockInsert.mockResolvedValue({ error: null })
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
  })

  function createRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 when triviaId is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const request = createRequest({})
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Trivia ID is required')
  })

  it('should remove favorite when already favorited', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { id: 'favorite-1' },
      error: null,
    })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.favorited).toBe(false)
  })

  it('should return 404 when trivia not found', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const request = createRequest({ triviaId: 'nonexistent' })
    const response = await POST(request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Trivia not found')
  })

  it('should add favorite successfully', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { username: 'favoriter' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.favorited).toBe(true)
  })

  it('should send notification when favoriting others post', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test Trivia', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { username: 'favoriter' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    await POST(request)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notify'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'favorite',
          triviaId: 'trivia-1',
          triviaTitle: 'Test Trivia',
          recipientUserId: 'author-1',
          actorUsername: 'favoriter',
        }),
      })
    )
  })

  it('should not send notification when favoriting own post', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test', user_id: 'user-1' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    await POST(request)

    expect(global.fetch).not.toHaveBeenCalled()
  })
})

describe('GET /api/favorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFrom.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
    })
    mockOrder.mockResolvedValue({ data: [], error: null })
  })

  it('should return favorited false when not authenticated and checking triviaId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost/api/favorite?triviaId=trivia-1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.favorited).toBe(false)
  })

  it('should return favorited status when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({ data: { id: 'favorite-1' }, error: null })

    const request = new NextRequest('http://localhost/api/favorite?triviaId=trivia-1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.favorited).toBe(true)
  })

  it('should return user favorites list', async () => {
    const mockFavorites = [
      {
        id: 'fav-1',
        created_at: '2024-01-15T10:00:00Z',
        trivia: { id: 'trivia-1', title: 'Test 1', hee_count: 10, created_at: '2024-01-14T10:00:00Z' },
      },
    ]
    mockOrder.mockResolvedValueOnce({ data: mockFavorites, error: null })

    const request = new NextRequest('http://localhost/api/favorite?userId=user-1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toEqual(mockFavorites)
  })

  it('should return 400 when no parameters provided', async () => {
    const request = new NextRequest('http://localhost/api/favorite')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid request')
  })

  it('should return 500 when database error occurs', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })

    const request = new NextRequest('http://localhost/api/favorite?userId=user-1')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Database error')
  })
})
